import Image from "next/image";

export default function Loading() {
  return (
    <div className="app-loading" aria-live="polite" aria-busy="true">
      <div className="loading-stack">
        <Image
          src="/mascot/mascot capsule.webp"
          alt="Capsule mascot"
          width={220}
          height={220}
          className="loading-mascot"
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        <div className="loading-text">Memuat Capsule...</div>
        <div className="loading-dots" aria-hidden="true">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    </div>
  );
}
