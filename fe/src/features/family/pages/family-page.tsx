import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../../auth/api";
import { useSessionState } from "../../auth/session-store";
import { ContributionSummary } from "../components/contribution-summary";
import { MemberList } from "../components/member-list";
import {
   createFamilyInvite,
   getFamilyMembers,
   getFamilySummary,
   removeFamilyMember,
   type FamilyInviteStatus,
} from "../api";

function toErrorMessage(error: unknown): string {
   if (error instanceof ApiError) {
      return error.message;
   }

   return "Failed to process request. Please try again.";
}

function formatDate(value: string | null): string {
   if (!value) {
      return "-";
   }

   const date = new Date(value);
   if (Number.isNaN(date.getTime())) {
      return value;
   }

   return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   }).format(date);
}

function resolveInviteLink(invite: FamilyInviteStatus): string {
   if (invite.inviteUrl) {
      return invite.inviteUrl;
   }

   if (typeof window === "undefined") {
      return invite.token;
   }

   return `${window.location.origin}/invite/${invite.token}`;
}

function FamilyMissingState() {
   return (
      <article className="family-card family-card--empty" aria-live="polite">
         <p className="page-card__eyebrow">Family</p>
         <h2>Family context not ready</h2>
         <p className="family-card__hint">
            We couldn't find an active family in this session. You can create a
            new family or join using an invite token.
         </p>
         <div className="family-card__cta-row">
            <Link className="family-card__link-action" to="/family/setup">
               Setup family
            </Link>
            <Link className="family-card__link-subaction" to="/family/join">
               Join with invite
            </Link>
         </div>
      </article>
   );
}

export function FamilyPageContent() {
   const queryClient = useQueryClient();
   const session = useSessionState();
   const familyId = session.familyId;
   const currentUserId = session.user?.id;
   const [actionError, setActionError] = useState<string | null>(null);
   const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
   const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

   const membersQuery = useQuery({
      queryKey: ["family-members", familyId],
      queryFn: () => getFamilyMembers(familyId ?? ""),
      enabled: Boolean(familyId),
   });

   const summaryQuery = useQuery({
      queryKey: ["family-summary", familyId, "month"],
      queryFn: () => getFamilySummary(familyId ?? "", "month"),
      enabled: Boolean(familyId),
   });

   const inviteMutation = useMutation({
      mutationFn: (id: string) => createFamilyInvite(id),
      onSuccess: async () => {
         setActionError(null);
         await queryClient.invalidateQueries({
            queryKey: ["family-members", familyId],
         });
      },
      onError: (error) => {
         setActionError(toErrorMessage(error));
      },
   });

   const removeMemberMutation = useMutation({
      mutationFn: (userId: string) =>
         removeFamilyMember(familyId ?? "", userId),
      onSuccess: async () => {
         setActionError(null);
         setMemberToDelete(null);
         await queryClient.invalidateQueries({
            queryKey: ["family-members", familyId],
         });
      },
      onError: (error) => {
         setActionError(toErrorMessage(error));
         setMemberToDelete(null);
      },
   });

   // Check if current user is owner
   const isOwner = useMemo(() => {
      const members = membersQuery.data?.members ?? [];
      const currentUserMember = members.find((m) => m.userId === currentUserId);
      return currentUserMember?.role?.toLowerCase() === "owner";
   }, [membersQuery.data?.members, currentUserId]);

   const latestInvite = useMemo(() => {
      const generated = inviteMutation.data;
      if (generated) {
         return generated;
      }

      const invites = membersQuery.data?.invites ?? [];
      return invites[0] ?? null;
   }, [inviteMutation.data, membersQuery.data?.invites]);

   if (!familyId) {
      return <FamilyMissingState />;
   }

   return (
      <>
         <article className="family-card">
            <div className="family-card__header-row">
               <div>
                  <p className="family-card__eyebrow">Invite center</p>
                  <h2>Latest invite</h2>
               </div>
               <button
                  type="button"
                  className="family-card__action"
                  disabled={inviteMutation.isPending}
                  onClick={() => {
                     setCopiedNotice(null);
                     if (!inviteMutation.isPending) {
                        inviteMutation.mutate(familyId);
                     }
                  }}
               >
                  {inviteMutation.isPending
                     ? "Generating..."
                     : "Generate new invite"}
               </button>
            </div>

            {actionError ? (
               <p className="family-page__error">{actionError}</p>
            ) : null}

            {latestInvite ? (
               <div className="family-invite-status">
                  <p>
                     <strong>Status:</strong> {latestInvite.status}
                  </p>
                  <p>
                     <strong>Expire:</strong>{" "}
                     {formatDate(latestInvite.expiresAt)}
                  </p>
                  <p className="family-invite-status__token">
                     {resolveInviteLink(latestInvite)}
                  </p>
                  <button
                     type="button"
                     className="family-card__subaction"
                     onClick={async () => {
                        try {
                           const value = resolveInviteLink(latestInvite);
                           if (!navigator.clipboard) {
                              setCopiedNotice(
                                 "Clipboard not available in this browser.",
                              );
                              return;
                           }

                           await navigator.clipboard.writeText(value);
                           setCopiedNotice("Invite link copied successfully.");
                        } catch {
                           setCopiedNotice("Failed to copy invite link.");
                        }
                     }}
                  >
                     Copy link
                  </button>
                  {copiedNotice ? (
                     <p className="family-card__hint">{copiedNotice}</p>
                  ) : null}
               </div>
            ) : (
               <p className="family-card__hint">
                  No active invite. Create a new invite to add members.
               </p>
            )}
         </article>

         <article className="family-card">
            <div className="family-card__header-row family-card__header-row--stacked">
               <div>
                  <p className="family-card__eyebrow">Members</p>
                  <h2>Family members</h2>
               </div>
            </div>
            {membersQuery.isLoading ? (
               <p className="family-card__hint">Loading members...</p>
            ) : null}
            <MemberList
               members={membersQuery.data?.members ?? []}
               currentUserId={currentUserId}
               isOwner={isOwner}
               onDeleteMember={(userId) => setMemberToDelete(userId)}
            />
            {memberToDelete ? (
               <div className="family-delete-confirm">
                  <p>
                     Are you sure you want to remove this member from the
                     family?
                  </p>
                  <div className="family-delete-confirm__buttons">
                     <button
                        type="button"
                        className="family-delete-confirm__cancel"
                        onClick={() => setMemberToDelete(null)}
                     >
                        Cancel
                     </button>
                     <button
                        type="button"
                        className="family-delete-confirm__confirm"
                        disabled={removeMemberMutation.isPending}
                        onClick={() => {
                           if (!removeMemberMutation.isPending) {
                              removeMemberMutation.mutate(memberToDelete);
                           }
                        }}
                     >
                        {removeMemberMutation.isPending
                           ? "Removing..."
                           : "Remove"}
                     </button>
                  </div>
               </div>
            ) : null}
         </article>

         <article className="family-card">
            <div className="family-card__header-row family-card__header-row--stacked">
               <div>
                  <p className="family-card__eyebrow">Contribution</p>
                  <h2>This month's contribution</h2>
               </div>
            </div>
            <ContributionSummary
               contributions={summaryQuery.data?.perMemberContributions ?? []}
               isLoading={summaryQuery.isLoading}
            />
         </article>
      </>
   );
}

export function FamilyPage() {
   return (
      <section className="family-page">
         <FamilyPageContent />
      </section>
   );
}
