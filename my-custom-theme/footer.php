<?php
/**
 * Theme footer: site footer, case-study overlay, and scripts.
 *
 * @package My_Custom_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

$brand_name = get_bloginfo('name');
$logo_url   = advisor_logo_url();
$home_url   = home_url('/');
$year       = gmdate('Y');
?>
  <footer class="site-footer" id="footer">
    <div class="container">
      <div class="footer-top-row">
        <div class="footer-brand-wrap">
          <a href="<?php echo esc_url($home_url); ?>" class="footer-logo">
            <img src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($brand_name); ?>" style="width: 44px; height: 44px; object-fit: contain;" data-content-src="brand.logo" />
            <span data-content="brand.name" style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: 0.18em;"><?php echo esc_html($brand_name); ?></span>
          </a>
          <div class="footer-tagline" data-content="footer.tagline">
            STRATEGY ✦ CREATIVITY ✦ GROWTH
          </div>
          <p class="footer-desc" data-content="footer.description">
            <?php
            $tagline = get_bloginfo('description', 'display');
            echo esc_html(
                $tagline
                    ? $tagline
                    : __('Advisor is an integrated marketing and creative agency that helps premium brands make smarter marketing decisions.', 'my-custom-theme')
            );
            ?>
          </p>
        </div>

        <div>
          <div class="footer-col-title"><?php esc_html_e('NAVIGATION', 'my-custom-theme'); ?></div>
          <?php advisor_nav_menu('footer', 'footer-links', 'footer-link', advisor_default_footer_items()); ?>
        </div>

        <div>
          <div class="footer-col-title"><?php esc_html_e('EXPERTISE', 'my-custom-theme'); ?></div>
          <?php advisor_nav_menu('footer_expertise', 'footer-links', 'footer-link', advisor_default_expertise_items()); ?>
        </div>

        <div>
          <div class="footer-col-title"><?php esc_html_e('DIRECT CONTACT', 'my-custom-theme'); ?></div>
          <div style="margin-bottom: 16px;">
            <a href="tel:01599990398" style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: #fff; text-decoration: none;" data-content="contact.phone" data-content-tel="contact.phone">
              01599990398
            </a>
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--text-dim); margin-bottom: 24px;">
            <span data-content="footer.website"><?php echo esc_html(wp_parse_url(home_url(), PHP_URL_HOST)); ?></span><br />
            <span data-content="footer.location"><?php esc_html_e('Cairo, Egypt', 'my-custom-theme'); ?></span>
          </div>
          <div class="footer-col-title"><?php esc_html_e('SOCIAL CHANNELS', 'my-custom-theme'); ?></div>
          <div style="display: flex; gap: 14px;" data-content-list="footer.socials">
            <a href="https://www.instagram.com/advisor_egypt?stkn=Zjkzdm1lMWJxcjl1" target="_blank" rel="noopener noreferrer" class="footer-link">Instagram</a>
            <span style="color: var(--text-dim);">•</span>
            <a href="https://www.facebook.com/AdvisorMisr?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" class="footer-link">Facebook</a>
            <span style="color: var(--text-dim);">•</span>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="footer-link">LinkedIn</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom-row">
        <div class="footer-copy" data-content="footer.copyright">
          © <?php echo esc_html($year); ?> <?php echo esc_html($brand_name); ?>. <?php esc_html_e('ALL RIGHTS RESERVED. YOU DREAM. WE CREATE. REALITY BEGINS.', 'my-custom-theme'); ?>
        </div>
        <button id="backToTopBtn" class="back-to-top-btn" aria-label="<?php esc_attr_e('Back to Top', 'my-custom-theme'); ?>">
          ↑
        </button>
      </div>
    </div>
  </footer>

  <div id="caseStudyOverlay" class="case-study-overlay" role="dialog" aria-modal="true" aria-labelledby="caseTitle" aria-hidden="true" inert data-lenis-prevent tabindex="-1">
    <div class="case-study-bar">
      <div class="case-study-breadcrumb">
        <span class="breadcrumb-cat" id="caseBreadcrumbCat" data-no-i18n>REAL ESTATE</span>
        <span>/</span>
        <span id="caseBreadcrumbTitle" data-no-i18n>DEYAR RESIDENCES</span>
      </div>
      <div class="case-study-controls">
        <button class="language-toggle" type="button" data-language-toggle data-no-i18n aria-label="Switch to Arabic">العربية</button>
        <button id="casePrevBtn" class="case-nav-btn" aria-label="<?php esc_attr_e('Previous Case Study', 'my-custom-theme'); ?>">
          <span>←</span>
          <span>PREV</span>
        </button>
        <button id="caseNextBtn" class="case-nav-btn" aria-label="<?php esc_attr_e('Next Case Study', 'my-custom-theme'); ?>">
          <span>NEXT</span>
          <span>→</span>
        </button>
        <button id="caseCloseBtn" class="case-close-btn" aria-label="<?php esc_attr_e('Close Case Study (Escape)', 'my-custom-theme'); ?>">
          ✕
        </button>
      </div>
    </div>

    <div class="case-study-content">
      <div class="case-hero">
        <div class="case-hero-meta">
          <span class="mono-tag" id="caseProjectNumber">PROJECT 01</span>
          <span class="service-pill" id="caseCategoryBadge" data-no-i18n>REAL ESTATE</span>
        </div>
        <h1 class="case-title" id="caseTitle" data-no-i18n>DEYAR RESIDENCES</h1>
        <p class="case-subtitle" id="caseSubtitle" data-no-i18n>High-End Property Investment & Living Experience</p>

        <div class="case-specs-grid">
          <div class="spec-item">
            <span class="spec-label">CLIENT</span>
            <span class="spec-value" id="specClient" data-no-i18n>Deyar Developments</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">INDUSTRY</span>
            <span class="spec-value" id="specIndustry" data-no-i18n>Real Estate</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">YEAR</span>
            <span class="spec-value" id="specYear" data-no-i18n>2024</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">SERVICES PROVIDED</span>
            <span class="spec-value" id="specServices" data-no-i18n>Social Strategy, Creative Direction</span>
          </div>
        </div>

        <div class="case-master-visual">
          <img id="caseMasterImg" data-no-i18n src="<?php echo esc_url(get_template_directory_uri() . '/assets/portfolio/deyar/deyar_campaign_board.jpg'); ?>" alt="Campaign Board" class="case-master-img" />
        </div>
      </div>

      <div class="case-narrative-grid">
        <div class="narrative-card">
          <span class="narrative-tag">01 / MARKET CONTEXT</span>
          <h3 class="narrative-heading">THE CHALLENGE</h3>
          <p class="narrative-text" id="caseChallenge" data-no-i18n></p>
        </div>

        <div class="narrative-card">
          <span class="narrative-tag">02 / STRATEGIC FORMULATION</span>
          <h3 class="narrative-heading">THE APPROACH</h3>
          <p class="narrative-text" id="caseApproach" data-no-i18n></p>
        </div>
      </div>

      <div class="narrative-card" style="margin-bottom: clamp(60px, 10vh, 120px);">
        <span class="narrative-tag">03 / ART DIRECTION & MESSAGING</span>
        <h3 class="narrative-heading">THE CREATIVE DIRECTION</h3>
        <p class="narrative-text" id="caseCreativeDirection" data-no-i18n></p>
      </div>

      <div class="case-results-strip">
        <h3 class="results-heading">
          <span>MEASURABLE BUSINESS IMPACT</span>
          <span style="color: var(--accent-light);">✦</span>
        </h3>
        <div class="results-metrics-grid" id="caseResultsContainer"></div>
      </div>

      <div class="case-gallery-section">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 20px;">
          <div>
            <span class="mono-tag">CAMPAIGN SPREADS</span>
            <h3 class="gallery-section-title">EDITORIAL VISUAL ASSETS</h3>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);">ORIGINAL ADVISOR CREATIVE DESIGNS</span>
        </div>

        <div class="case-editorial-gallery" id="caseEditorialGallery"></div>
      </div>

      <div class="case-next-project" id="caseNextTeaser">
        <div>
          <div class="next-label" id="caseNextNumber">NEXT UP — 02</div>
          <div class="next-title" id="caseNextTitle" data-no-i18n>EL BASHA MOTORS</div>
        </div>
        <div class="btn-magnetic btn-primary" style="padding: 16px 32px;">
          <span>READ NEXT CASE STUDY</span>
          <span>→</span>
        </div>
      </div>
    </div>
  </div>

<?php wp_footer(); ?>
</body>
</html>
