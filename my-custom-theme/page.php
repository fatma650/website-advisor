<?php
/**
 * Default template for WordPress pages.
 *
 * @package My_Custom_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main id="main-content" class="wp-document">
  <div class="container">
    <?php
    if (have_posts()) :
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
              <header class="wp-document-header">
                <h1 class="wp-document-title"><?php the_title(); ?></h1>
              </header>
              <?php if (has_post_thumbnail()) : ?>
                <div class="wp-document-thumb">
                  <?php the_post_thumbnail('large'); ?>
                </div>
              <?php endif; ?>
              <div class="wp-document-content">
                <?php the_content(); ?>
              </div>
            </article>
            <?php
        endwhile;
    endif;
    ?>
  </div>
</main>
<?php
get_footer();
