<?php
/**
 * Theme header: document head, brand, and navigation.
 *
 * @package My_Custom_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

$brand_name    = get_bloginfo('name');
$brand_tagline = get_bloginfo('description', 'display');
$logo_url      = advisor_logo_url();
$home_url      = home_url('/');
$nav_items     = advisor_default_nav_items();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
  <a class="screen-reader-text" href="#main-content"><?php esc_html_e('Skip to content', 'my-custom-theme'); ?></a>

  <div class="noise-overlay"></div>
  <div class="ambient-glow glow-purple" style="top: 5vh; left: 10vw; width: 600px; height: 600px;"></div>
  <div class="ambient-glow glow-blue" style="top: 40vh; right: 5vw; width: 700px; height: 700px;"></div>
  <div class="ambient-glow glow-purple" style="top: 160vh; left: 5vw; width: 800px; height: 800px;"></div>
  <div class="ambient-glow glow-purple" style="bottom: 10vh; right: 10vw; width: 900px; height: 900px;"></div>

  <header class="site-header">
    <div class="container nav-container">
      <a href="<?php echo esc_url($home_url); ?>" class="brand-logo" aria-label="<?php echo esc_attr($brand_name); ?>">
        <img src="<?php echo esc_url($logo_url); ?>" alt="<?php echo esc_attr($brand_name); ?>" class="brand-monogram-img" data-content-src="brand.logo" />
        <div class="brand-name-wrap">
          <span class="brand-title" data-content="brand.name"><?php echo esc_html($brand_name); ?></span>
          <?php if ($brand_tagline) : ?>
            <span class="brand-sub" data-content="brand.subtitle"><?php echo esc_html($brand_tagline); ?></span>
          <?php endif; ?>
        </div>
      </a>

      <nav aria-label="<?php esc_attr_e('Main Navigation', 'my-custom-theme'); ?>">
        <?php advisor_nav_menu('primary', 'nav-menu', 'nav-link', $nav_items); ?>
      </nav>

      <div class="nav-actions">
        <button class="language-toggle" type="button" data-language-toggle data-no-i18n aria-label="Switch to Arabic">العربية</button>
        <a href="<?php echo esc_url($home_url . '#contact'); ?>" class="btn-magnetic btn-primary" style="padding: 10px 22px; font-size: 0.8125rem;">
          <span data-content="brand.ctaLabel"><?php esc_html_e('Start a Project', 'my-custom-theme'); ?></span>
          <span>→</span>
        </a>
        <button class="mobile-toggle" aria-label="<?php esc_attr_e('Open Navigation Menu', 'my-custom-theme'); ?>">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="mobile-drawer" aria-hidden="true" inert data-lenis-prevent>
    <div class="mono-tag" style="margin-bottom: 30px;"><?php esc_html_e('MENU NAVIGATION', 'my-custom-theme'); ?></div>
    <?php
    $mobile_items = $nav_items;
    $mobile_items[] = array($home_url . '#contact', __('Start a Project', 'my-custom-theme'));
    advisor_nav_menu('mobile', 'mobile-menu-links', 'mobile-menu-link', $mobile_items);
    ?>
    <div style="margin-top: 40px; font-family: var(--font-mono); font-size: 0.875rem; color: var(--text-dim);">
      <?php esc_html_e('Direct Inquiries:', 'my-custom-theme'); ?>
      <a href="tel:01599990398" style="color: #fff; text-decoration: none;" data-content="contact.phone" data-content-tel="contact.phone">01599990398</a>
    </div>
  </div>
