import { FamilyPageContent } from './family-page'

export function FamilyManagementPage() {
  return (
    <section className="family-page family-management-page" aria-labelledby="family-management-title">
      <header className="family-page__header family-management-page__header">
        <div>
          <p className="page-card__eyebrow">Family hub</p>
          <h1 id="family-management-title">Kelola family Anda dari satu ruang yang lebih terstruktur.</h1>
          <p>Invite member baru, cek siapa yang aktif, dan pantau kontribusi bulanan dari tampilan yang selaras dengan halaman lain.</p>
        </div>
        <div className="family-page__hero-card" aria-hidden="true">
          <p>Family control</p>
          <strong>Invite, monitor, organize</strong>
        </div>
      </header>

      <FamilyPageContent />
    </section>
  )
}
