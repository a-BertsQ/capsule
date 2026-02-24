import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="page-wrap">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Platform E-Learning
                <span className="gradient-text"> Adaptasi </span>
                Mahasiswa Farmasi
              </h1>
              <p className="hero-description">
                Bergabunglah dengan Capsule - platform pembelajaran digital yang dirancang khusus untuk mahasiswa farmasi. 
                Pelajari konsep farmasi dengan materi interaktif dan dukungan tutor profesional.
              </p>
              <div className="hero-actions">
                <Link href="/signup" className="btn btn-primary btn-lg">
                  Mulai Belajar Sekarang
                </Link>
                <Link href="/signin" className="btn btn-outline btn-lg">
                  Masuk
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-mascot">
                <Image
                  src="/mascot/mascot capsule.webp"
                  alt="Capsule mascot"
                  width={360}
                  height={360}
                  className="mascot-image"
                  priority
                />
              </div>
              <div className="hero-badge">
                <span>🧪</span>
                <span>Platform Farmasi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="page-wrap">
          <div className="section-header">
            <h2 className="section-title">Mengapa Memilih Capsule?</h2>
            <p className="section-description">
              Platform pembelajaran yang dirancang khusus untuk kebutuhan mahasiswa farmasi modern
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Materi Komprehensif</h3>
              <p className="feature-description">
                Akses ribuan materi pembelajaran farmasi yang telah dikurasi oleh ahli di bidangnya
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3 className="feature-title">Tutor Profesional</h3>
              <p className="feature-description">
                Belajar langsung dari praktisi dan akademisi farmasi berpengalaman
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Pembelajaran Adaptif</h3>
              <p className="feature-description">
                Sistem pembelajaran yang menyesuaikan dengan gaya dan kecepatan belajar Anda
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">
                Monitor kemajuan belajar Anda dengan dashboard yang intuitif dan insightful
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="page-wrap">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="benefits-title">Siap Menjadi Farmasis Masa Depan?</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Akses 24/7 ke materi pembelajaran</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Sertifikat digital untuk setiap modul</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Komunitas mahasiswa farmasi se-Indonesia</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Update materi sesuai standar industri terkini</span>
                </div>
              </div>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Bergabung Sekarang
              </Link>
            </div>
            <div className="benefits-visual">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Mahasiswa Aktif</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Modul Pembelajaran</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Tingkat Kepuasan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
