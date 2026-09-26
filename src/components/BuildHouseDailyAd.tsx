const AD_IMAGE_URL =
  'https://raw.githubusercontent.com/Gitkierenoffical/image-store-for-cordoval/main/build%20house%20daily%20image%20ad.png'

const AD_LINK = 'https://buildhousedaily.beehiiv.com/'

export function BuildHouseDailyAd() {
  return (
    <aside className="build-house-daily-ad" aria-label="Sponsored">
      <a
        href={AD_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="build-house-daily-ad__link"
      >
        <img
          src={AD_IMAGE_URL}
          alt="Build House Daily newsletter"
          className="build-house-daily-ad__image"
          width={960}
          loading="lazy"
          decoding="async"
        />
      </a>
    </aside>
  )
}
