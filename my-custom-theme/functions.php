<?php
/**
 * Advisor Custom Theme — setup, assets, menus, logo, SEO.
 *
 * @package My_Custom_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ADVISOR_THEME_VERSION', '1.0.0');

/**
 * Theme supports, image sizes, and menu locations.
 */
function advisor_theme_setup()
{
    load_theme_textdomain('my-custom-theme', get_template_directory() . '/languages');

    add_theme_support('title-tag');
    add_theme_support('automatic-feed-links');
    add_theme_support('post-thumbnails');
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 88,
            'width'       => 88,
            'flex-height' => true,
            'flex-width'  => true,
        )
    );
    add_theme_support(
        'html5',
        array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script')
    );
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    add_theme_support('wp-block-styles');

    register_nav_menus(
        array(
            'primary'           => __('Primary Menu', 'my-custom-theme'),
            'mobile'            => __('Mobile Menu', 'my-custom-theme'),
            'footer'            => __('Footer Menu', 'my-custom-theme'),
            'footer_expertise'  => __('Footer Expertise Menu', 'my-custom-theme'),
        )
    );
}
add_action('after_setup_theme', 'advisor_theme_setup');

/**
 * Enqueue theme CSS and JS in the original load order.
 */
function advisor_enqueue_assets()
{
    $uri = get_template_directory_uri();
    $ver = ADVISOR_THEME_VERSION;

    wp_enqueue_style('advisor-main', $uri . '/css/main.css', array(), $ver);
    wp_enqueue_style('advisor-animations', $uri . '/css/animations.css', array('advisor-main'), $ver);
    wp_enqueue_style('advisor-case-study', $uri . '/css/case-study.css', array('advisor-main'), $ver);
    wp_enqueue_style('advisor-localization', $uri . '/css/localization.css', array('advisor-main'), $ver);
    wp_enqueue_style(
        'advisor-theme',
        get_stylesheet_uri(),
        array('advisor-main', 'advisor-animations', 'advisor-case-study', 'advisor-localization'),
        $ver
    );

    wp_enqueue_script('advisor-lenis', $uri . '/vendor/lenis.min.js', array(), $ver, true);
    wp_enqueue_script('advisor-gsap', $uri . '/vendor/gsap.min.js', array(), $ver, true);
    wp_enqueue_script('advisor-scrolltrigger', $uri . '/vendor/ScrollTrigger.min.js', array('advisor-gsap'), $ver, true);
    wp_enqueue_script('advisor-site-config', $uri . '/js/site-config.js', array(), $ver, true);
    wp_enqueue_script('advisor-portfolio-data', $uri . '/js/portfolio-data.js', array(), $ver, true);
    wp_enqueue_script('advisor-translations', $uri . '/js/translations.js', array(), $ver, true);
    wp_enqueue_script('advisor-project-translations', $uri . '/js/project-translations.js', array('advisor-translations'), $ver, true);
    wp_enqueue_script(
        'advisor-theme-boot',
        $uri . '/js/theme-boot.js',
        array('advisor-site-config', 'advisor-portfolio-data'),
        $ver,
        true
    );
    wp_enqueue_script('advisor-content-api', $uri . '/js/content-api.js', array('advisor-theme-boot'), $ver, true);
    wp_enqueue_script('advisor-i18n', $uri . '/js/i18n.js', array('advisor-translations', 'advisor-content-api'), $ver, true);
    wp_enqueue_script('advisor-site-sections', $uri . '/js/site-sections.js', array('advisor-i18n'), $ver, true);
    wp_enqueue_script('advisor-scroll-manager', $uri . '/js/scroll-manager.js', array('advisor-lenis'), $ver, true);
    wp_enqueue_script('advisor-cursor', $uri . '/js/cursor.js', array(), $ver, true);
    wp_enqueue_script('advisor-hero-canvas', $uri . '/js/hero-canvas.js', array(), $ver, true);
    wp_enqueue_script('advisor-split-vision', $uri . '/js/split-vision.js', array(), $ver, true);
    wp_enqueue_script('advisor-case-study-modal', $uri . '/js/case-study-modal.js', array('advisor-content-api'), $ver, true);
    wp_enqueue_script(
        'advisor-contact-form',
        $uri . '/js/contact-form.js',
        array('advisor-site-config', 'advisor-i18n'),
        $ver,
        true
    );
    wp_enqueue_script(
        'advisor-app',
        $uri . '/js/app.js',
        array(
            'advisor-lenis',
            'advisor-gsap',
            'advisor-scrolltrigger',
            'advisor-theme-boot',
            'advisor-content-api',
            'advisor-i18n',
            'advisor-scroll-manager',
            'advisor-site-sections',
            'advisor-hero-canvas',
            'advisor-split-vision',
            'advisor-case-study-modal',
            'advisor-contact-form',
        ),
        $ver,
        true
    );

    wp_localize_script(
        'advisor-theme-boot',
        'ADVISOR_THEME',
        array(
            'uri'  => $uri,
            'home' => home_url('/'),
        )
    );
}
add_action('wp_enqueue_scripts', 'advisor_enqueue_assets');

/**
 * Dynamic document title separator.
 */
function advisor_document_title_separator()
{
    return '—';
}
add_filter('document_title_separator', 'advisor_document_title_separator');

/**
 * Prefer the Site Title + Tagline on the front page.
 *
 * @param array $title Title parts.
 * @return array
 */
function advisor_document_title_parts($title)
{
    if (is_front_page()) {
        $title['title'] = get_bloginfo('name', 'display');
        $tagline = get_bloginfo('description', 'display');
        if ($tagline) {
            $title['tagline'] = $tagline;
        }
    }
    return $title;
}
add_filter('document_title_parts', 'advisor_document_title_parts');

/**
 * Basic SEO meta, Open Graph, Twitter cards, canonical, and favicon.
 */
function advisor_seo_meta()
{
    if (is_singular()) {
        $post        = get_queried_object();
        $title       = wp_get_document_title();
        $description = has_excerpt($post) ? get_the_excerpt($post) : wp_trim_words(wp_strip_all_tags($post->post_content), 32);
        $url         = get_permalink($post);
        $image       = get_the_post_thumbnail_url($post, 'full');
    } else {
        $title       = wp_get_document_title();
        $description = get_bloginfo('description', 'display');
        $url         = home_url('/');
        $image       = '';
    }

    if (!$description) {
        $description = __('ADVISOR is a premier strategic marketing and creative agency based in Egypt. We combine market insight, strategic direction, and creative execution to move brands forward.', 'my-custom-theme');
    }

    if (!$image) {
        $logo_id = get_theme_mod('custom_logo');
        $image   = $logo_id
            ? wp_get_attachment_image_url($logo_id, 'full')
            : get_template_directory_uri() . '/assets/brand/advisor_monogram.png';
    }

    echo '<meta name="description" content="' . esc_attr($description) . '" />' . "\n";

    if (is_singular() || is_front_page()) {
        echo '<link rel="canonical" href="' . esc_url($url) . '" />' . "\n";
    }

    echo '<meta property="og:locale" content="' . esc_attr(str_replace('_', '-', get_locale())) . '" />' . "\n";
    echo '<meta property="og:type" content="' . (is_singular() && !is_front_page() ? 'article' : 'website') . '" />' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($title) . '" />' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($description) . '" />' . "\n";
    echo '<meta property="og:url" content="' . esc_url($url) . '" />' . "\n";
    echo '<meta property="og:site_name" content="' . esc_attr(get_bloginfo('name')) . '" />' . "\n";
    echo '<meta property="og:image" content="' . esc_url($image) . '" />' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($title) . '" />' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($description) . '" />' . "\n";
    echo '<meta name="twitter:image" content="' . esc_url($image) . '" />' . "\n";

    if (!has_site_icon()) {
        echo '<link rel="icon" type="image/png" href="' . esc_url(get_template_directory_uri() . '/assets/brand/advisor_monogram.png') . '" />' . "\n";
    }
}
add_action('wp_head', 'advisor_seo_meta', 1);

/**
 * Logo URL from Customizer, with the theme monogram as fallback.
 *
 * @return string
 */
function advisor_logo_url()
{
    $logo_id = get_theme_mod('custom_logo');
    if ($logo_id) {
        $url = wp_get_attachment_image_url($logo_id, 'full');
        if ($url) {
            return $url;
        }
    }
    return get_template_directory_uri() . '/assets/brand/advisor_monogram.png';
}

/**
 * Print a nav menu with the original link class, or a fallback list.
 *
 * @param string $location   Theme location.
 * @param string $menu_class UL class.
 * @param string $link_class Anchor class.
 * @param array  $fallback   Array of array(url, label).
 */
function advisor_nav_menu($location, $menu_class, $link_class, $fallback)
{
    if (has_nav_menu($location)) {
        $walker             = new Advisor_Nav_Walker();
        $walker->link_class = $link_class;
        wp_nav_menu(
            array(
                'theme_location' => $location,
                'container'      => false,
                'menu_class'     => $menu_class,
                'fallback_cb'    => false,
                'depth'          => 1,
                'walker'         => $walker,
            )
        );
        return;
    }

    echo '<ul class="' . esc_attr($menu_class) . '">';
    foreach ($fallback as $item) {
        echo '<li><a href="' . esc_url($item[0]) . '" class="' . esc_attr($link_class) . '">' . esc_html($item[1]) . '</a></li>';
    }
    echo '</ul>';
}

/**
 * Default section links used until menus are assigned in Appearance → Menus.
 *
 * @return array
 */
function advisor_default_nav_items()
{
    $home = home_url('/');
    return array(
        array($home . '#about', __('About', 'my-custom-theme')),
        array($home . '#vision', __('Vision & Mission', 'my-custom-theme')),
        array($home . '#services', __('Services', 'my-custom-theme')),
        array($home . '#work', __('Selected Work', 'my-custom-theme')),
        array($home . '#why-advisor', __('Why Advisor', 'my-custom-theme')),
        array($home . '#clients', __('Clients', 'my-custom-theme')),
    );
}

/**
 * Default footer navigation labels.
 *
 * @return array
 */
function advisor_default_footer_items()
{
    $home = home_url('/');
    return array(
        array($home . '#about', __('About Agency', 'my-custom-theme')),
        array($home . '#vision', __('Vision & Mission', 'my-custom-theme')),
        array($home . '#services', __('Services', 'my-custom-theme')),
        array($home . '#work', __('Selected Work', 'my-custom-theme')),
        array($home . '#why-advisor', __('Why Advisor', 'my-custom-theme')),
        array($home . '#clients', __('Clients Wall', 'my-custom-theme')),
    );
}

/**
 * Default expertise column in the footer.
 *
 * @return array
 */
function advisor_default_expertise_items()
{
    $url = home_url('/#services');
    return array(
        array($url, __('Creative Strategy', 'my-custom-theme')),
        array($url, __('Brand Creation', 'my-custom-theme')),
        array($url, __('Social Media', 'my-custom-theme')),
        array($url, __('Creative Production', 'my-custom-theme')),
        array($url, __('Packaging Design', 'my-custom-theme')),
        array($url, __('UI/UX & Web', 'my-custom-theme')),
    );
}

/**
 * Flat walker that applies the original CSS class to every link.
 */
class Advisor_Nav_Walker extends Walker_Nav_Menu
{
    /**
     * CSS class applied to each <a>.
     *
     * @var string
     */
    public $link_class = 'nav-link';

    /**
     * @param string   $output Used to append additional content (passed by reference).
     * @param WP_Post  $item   Menu item data object.
     * @param int      $depth  Depth of menu item.
     * @param stdClass $args   An object of wp_nav_menu() arguments.
     * @param int      $id     Current item ID.
     */
    public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0)
    {
        $output .= '<li>';
        $output .= '<a href="' . esc_url($item->url) . '" class="' . esc_attr($this->link_class) . '">';
        $output .= esc_html($item->title);
        $output .= '</a>';
    }

    /**
     * @param string   $output Used to append additional content (passed by reference).
     * @param WP_Post  $item   Page data object. Not used.
     * @param int      $depth  Depth of page. Not Used.
     * @param stdClass $args   An object of wp_nav_menu() arguments.
     */
    public function end_el(&$output, $item, $depth = 0, $args = null)
    {
        $output .= '</li>';
    }
}
