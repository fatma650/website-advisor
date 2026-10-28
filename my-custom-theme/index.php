<?php
/**
 * Main template: marketing homepage, or a posts list when a Posts page is assigned.
 *
 * @package My_Custom_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

if (is_home() && !is_front_page()) :
    ?>
<main id="main-content" class="wp-document">
  <div class="container">
    <header class="wp-document-header">
      <h1 class="wp-document-title"><?php single_post_title(); ?></h1>
    </header>
    <div class="wp-posts-list">
      <?php
        if (have_posts()) :
            while (have_posts()) :
                the_post();
                ?>
                <a class="wp-post-card" href="<?php the_permalink(); ?>">
                  <h2><?php the_title(); ?></h2>
                  <p><?php echo esc_html(get_the_excerpt()); ?></p>
                </a>
                <?php
            endwhile;
            the_posts_pagination();
        else :
            echo '<p>' . esc_html__('No posts found.', 'my-custom-theme') . '</p>';
        endif;
        ?>
    </div>
  </div>
</main>
    <?php
    get_footer();
    return;
endif;

$home = home_url('/');
?>
<main id="main-content">
    <section class="hero-section" id="hero">
      <canvas id="heroCanvas" class="hero-canvas"></canvas>

      <div class="container hero-content">
        <div class="hero-tag-wrap">
          <span class="mono-tag" data-content="hero.tag">STRATEGIC MARKETING & CREATIVE AGENCY</span>
        </div>

        <h1 class="hero-headline" data-content-list="hero.lines" aria-label="WE DON'T JUST MARKET. WE ADVISE. WE CREATE. WE GROW.">
          <span class="hero-line"><span class="hero-line-inner">WE DON’T JUST MARKET.</span></span>
          <span class="hero-line"><span class="hero-line-inner text-gradient-purple">WE ADVISE.</span></span>
          <span class="hero-line"><span class="hero-line-inner">WE CREATE.</span></span>
          <span class="hero-line"><span class="hero-line-inner text-gradient-purple">WE GROW.</span></span>
        </h1>

        <div class="hero-subrow">
          <p class="hero-subcopy" data-content="hero.subcopy">
            Strategy-led marketing and creative solutions built to move brands forward through insight, deliberate art direction, and measurable impact.
          </p>
          <div class="hero-cta-group">
            <a href="<?php echo esc_url($home . '#work'); ?>" class="btn-magnetic btn-primary">
              <span data-content="hero.primaryCta">Explore Our Work</span>
              <span>↓</span>
            </a>
            <a href="<?php echo esc_url($home . '#contact'); ?>" class="btn-magnetic btn-outline">
              <span data-content="hero.secondaryCta">Start a Project</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>

      <a href="<?php echo esc_url($home . '#about'); ?>" class="hero-scroll-prompt" aria-label="Scroll to explore">
        <span data-content="hero.scrollPrompt">Scroll to explore</span>
        <div class="scroll-line"></div>
      </a>
    </section>

    <div class="ticker-wrap" aria-hidden="true">
      <div class="ticker-track" data-content-list="hero.ticker">
        <span class="ticker-item">STRATEGY <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">CREATIVE DIRECTION <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">BRANDING <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">SOCIAL MEDIA <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">CONTENT <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">DIGITAL EXPERIENCES <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">PRODUCTION <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">STRATEGY <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">CREATIVE DIRECTION <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">BRANDING <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">SOCIAL MEDIA <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">CONTENT <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">DIGITAL EXPERIENCES <span class="ticker-sparkle">✦</span></span>
        <span class="ticker-item">PRODUCTION <span class="ticker-sparkle">✦</span></span>
      </div>
    </div>

    <section class="about-section" id="about">
      <div class="about-visual-backdrop"></div>
      <div class="container">
        <div class="about-editorial-grid">
          <div>
            <span class="mono-tag" style="margin-bottom: 24px;" data-content="about.tag">PHILOSOPHY & POSITIONING</span>
            <h2 class="about-headline">
              <span data-content="about.title">STRATEGY</span><br />
              <span class="text-gradient-purple" data-content="about.titleAccent">BEFORE NOISE.</span>
            </h2>
          </div>
          <div>
            <p class="about-text-lead" data-content="about.lead">
              We believe great marketing starts with understanding. We combine market insight, strategic thinking and creative execution to build brands that communicate clearly, connect meaningfully and grow measurably.
            </p>
            <p class="about-text-sub" data-content="about.body">
              Our role goes beyond executing campaigns. We take the time to analyze consumer behavior across Egyptian and regional Arab markets, uncovering distinctive opportunities to create an indelible brand reality.
            </p>
            <div class="about-stats" data-content-list="about.stats">
              <div>
                <div class="about-stat-value">100%</div>
                <div class="about-stat-label">DATA-LED STRATEGY</div>
              </div>
              <div class="about-stat-divider"></div>
              <div>
                <div class="about-stat-value">60fps</div>
                <div class="about-stat-label">BESPOKE CRAFT</div>
              </div>
            </div>
          </div>
        </div>

        <div class="kinetic-words-wrap" aria-hidden="true">
          <div class="kinetic-words-row" data-content-list="about.words">
            <span class="kinetic-word">UNDERSTAND</span>
            <span class="kinetic-word highlight">STRATEGIZE</span>
            <span class="kinetic-word">CREATE</span>
            <span class="kinetic-word highlight">CONNECT</span>
            <span class="kinetic-word">GROW</span>
          </div>
        </div>
      </div>
    </section>

    <section class="vision-mission-section" id="vision">
      <div class="container">
        <div style="margin-bottom: 48px; text-align: center;">
          <span class="mono-tag" data-content="vision.tag">FOUNDATIONAL PILLARS</span>
          <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4.5vw, 3.75rem); font-weight: 800; text-transform: uppercase; margin-top: 12px;">
            <span data-content="vision.title">VISION &</span> <span class="text-gradient-purple" data-content="vision.titleAccent">MISSION</span>
          </h2>
        </div>

        <div class="split-screen-container">
          <div class="split-seam"></div>

          <div class="split-panel panel-vision">
            <div class="split-panel-bg"></div>
            <div class="split-header">
              <span class="mono-tag" data-content="vision.visionTag">OUR DESTINATION</span>
              <h3 class="split-title" data-content="vision.visionTitle">OUR VISION</h3>
            </div>
            <div class="split-body">
              <p class="split-quote" data-content="vision.visionQuote">
                “To become a leading strategic marketing partner for premium brands across the region.”
              </p>
              <p style="font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted);" data-content="vision.visionBody">
                We aim to help brands grow through innovative strategies, meaningful communication, and measurable results. We believe every brand has a story worth telling. Our role is to help that story reach the right audience, at the right time, and in the right way.
              </p>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-light); z-index: 2;" data-content-list="vision.visionKeywords">
              <span>REGIONAL EXPANSION</span>
              <span>✦</span>
              <span>PREMIUM BENCHMARK</span>
            </div>
          </div>

          <div class="split-panel panel-mission">
            <div class="split-panel-bg"></div>
            <div class="split-header">
              <span class="mono-tag" data-content="vision.missionTag">HOW WE OPERATE</span>
              <h3 class="split-title" data-content="vision.missionTitle">OUR MISSION</h3>
            </div>
            <div class="split-body">
              <p class="split-quote" data-content="vision.missionQuote">
                “We help brands make smarter marketing decisions through market understanding, strategic direction, meaningful connections and measurable growth.”
              </p>
              <div class="mission-pillars" data-content-list="vision.pillars">
                <div class="pillar-item">
                  <div class="pillar-num">01 / DISCOVERY</div>
                  <div class="pillar-name">Market Understanding</div>
                  <div class="pillar-desc">Analyzing market dynamics, audience psychology, and growth opportunities.</div>
                </div>
                <div class="pillar-item">
                  <div class="pillar-num">02 / ARCHITECTURE</div>
                  <div class="pillar-name">Strategic Direction</div>
                  <div class="pillar-desc">Turning complex market insights into clear roadmaps and objectives.</div>
                </div>
                <div class="pillar-item">
                  <div class="pillar-num">03 / STORYTELLING</div>
                  <div class="pillar-name">Meaningful Connections</div>
                  <div class="pillar-desc">Forging authentic relationships through purposeful creative craft.</div>
                </div>
                <div class="pillar-item">
                  <div class="pillar-num">04 / METRICS</div>
                  <div class="pillar-name">Measurable Growth</div>
                  <div class="pillar-desc">Focusing on concrete commercial return—never vanity campaigns.</div>
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-light); z-index: 2;" data-content-list="vision.missionKeywords">
              <span>MEASURABLE OUTCOMES</span>
              <span>✦</span>
              <span>TANGIBLE IMPACT</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="services-section" id="services">
      <div class="container">
        <div class="services-header">
          <span class="mono-tag" data-content="services.tag">FULL-SERVICE SPECTRUM</span>
          <h2 class="services-headline">
            <span data-content="services.title">WHAT WE BRING</span><br />
            <span class="text-gradient-purple" data-content="services.titleAccent">TO THE TABLE.</span>
          </h2>
        </div>

        <div class="services-list" data-content-list="services.items">
          <div class="service-item">
            <div class="service-num">01</div>
            <div>
              <h3 class="service-title">CREATIVE STRATEGY & ART DIRECTION</h3>
            </div>
            <p class="service-desc">Strategic concepts, high-level campaign direction, and evocative visual storytelling crafted to differentiate your brand.</p>
          </div>
          <div class="service-item">
            <div class="service-num">02</div>
            <div>
              <h3 class="service-title">IDENTITY & BRAND CREATION</h3>
            </div>
            <p class="service-desc">Complete brand positioning, custom logo marks, comprehensive visual identity systems, and uncompromising guidelines.</p>
          </div>
          <div class="service-item">
            <div class="service-num">03</div>
            <div>
              <h3 class="service-title">CREATIVE PRODUCTION</h3>
            </div>
            <p class="service-desc">End-to-end management from concept development and storyboarding to final multi-platform creative execution.</p>
          </div>
          <div class="service-item">
            <div class="service-num">04</div>
            <div>
              <h3 class="service-title">SOCIAL MEDIA</h3>
            </div>
            <p class="service-desc">Full-scale content calendars, editorial feed architecture, high-converting creative design, and community-first communication.</p>
          </div>
          <div class="service-item">
            <div class="service-num">05</div>
            <div>
              <h3 class="service-title">PHOTOGRAPHY & CONTENT</h3>
            </div>
            <p class="service-desc">Art-directed commercial photography, lifestyle content, and motion graphics built specifically for modern digital platforms.</p>
          </div>
          <div class="service-item">
            <div class="service-num">06</div>
            <div>
              <h3 class="service-title">DIGITAL & INTERACTIVE MEDIA</h3>
            </div>
            <p class="service-desc">Immersive interactive digital experiences, microsites, and campaign landing pages designed around contemporary user behaviour.</p>
          </div>
          <div class="service-item">
            <div class="service-num">07</div>
            <div>
              <h3 class="service-title">UI/UX DESIGN & DEVELOPMENT</h3>
            </div>
            <p class="service-desc">User-centric digital interfaces and digital products marrying sleek minimalist aesthetics with effortless utility.</p>
          </div>
          <div class="service-item">
            <div class="service-num">08</div>
            <div>
              <h3 class="service-title">PACKAGING DESIGN</h3>
            </div>
            <p class="service-desc">Strategic luxury packaging that turns physical consumer goods into unforgettable unboxing brand experiences.</p>
          </div>
          <div class="service-item">
            <div class="service-num">09</div>
            <div>
              <h3 class="service-title">PROPOSALS & PRESENTATIONS</h3>
            </div>
            <p class="service-desc">High-stakes investor decks, keynote presentations, and pitch books engineered to communicate complex ideas clearly and persuasively.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="work-section" id="work">
      <div class="container">
        <div class="work-header-wrap">
          <div>
            <span class="mono-tag" data-content="work.tag">AUTHENTIC CASE STUDIES</span>
            <h2 class="work-headline">
              <span data-content="work.title">WORK THAT</span><br />
              <span class="text-gradient-purple" data-content="work.titleAccent">SPEAKS FOR ITSELF.</span>
            </h2>
          </div>

          <div class="work-filters" role="group" aria-label="Project categories">
            <button class="filter-btn active" data-filter="ALL">All Projects</button>
            <button class="filter-btn" data-filter="REAL ESTATE">Real Estate</button>
            <button class="filter-btn" data-filter="AUTOMOTIVE">Automotive</button>
            <button class="filter-btn" data-filter="FASHION">Fashion</button>
            <button class="filter-btn" data-filter="GIFTS & LIFESTYLE">Gifts & Lifestyle</button>
            <button class="filter-btn" data-filter="MEDICAL & HEALTHCARE">Healthcare</button>
            <button class="filter-btn" data-filter="BRANDING">Branding</button>
          </div>
        </div>
      </div>

      <div class="projects-slider-wrapper">
        <button class="slider-arrow-btn slider-arrow-prev" id="projectsPrevBtn" type="button" aria-label="Previous Projects" title="Previous Projects">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div class="projects-slider-viewport" aria-label="Portfolio Projects Carousel">
          <div class="projects-track" id="projectsTrack"></div>
        </div>

        <button class="slider-arrow-btn slider-arrow-next" id="projectsNextBtn" type="button" aria-label="Next Projects" title="Next Projects">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <div class="container work-controls-row">
        <span class="mono-tag" style="font-size: 0.75rem;" data-content="work.dragHint">← CLICK & DRAG OR SCROLL HORIZONTALLY →</span>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim);"><span id="liveProjectCount" data-no-i18n>6</span> <span data-content="work.countLabel">CLIENT CASE STUDIES</span></span>
      </div>
    </section>

    <section class="why-section" id="why-advisor">
      <div class="container">
        <div class="why-header">
          <span class="mono-tag" data-content="why.tag">OUR COMPETITIVE EDGE</span>
          <h2 class="why-lead-title">
            <span data-content="why.title">WHY</span><br />
            <span class="text-gradient-purple" data-content="why.titleAccent">ADVISOR?</span>
          </h2>
          <p class="why-lead-sub" data-content="why.lead">
            Because we believe your brand deserves more than a temporary campaign. It deserves an enduring strategy.
          </p>
        </div>

        <div class="why-statements-list" data-content-list="why.items">
          <div class="why-statement-item">
            <div class="why-num">01</div>
            <h3 class="why-claim">WE ADVISE,<br />NOT JUST EXECUTE.</h3>
            <p class="why-detail">We approach every project from a strategic perspective, using rigorous market insights and competitive analysis to guide every design and media decision.</p>
          </div>
          <div class="why-statement-item">
            <div class="why-num">02</div>
            <h3 class="why-claim">WE UNDERSTAND<br />THE AUDIENCE.</h3>
            <p class="why-detail">We focus on understanding the deep cultural and purchasing behavior of upper and upper-middle audiences across the Egyptian and Arab markets.</p>
          </div>
          <div class="why-statement-item">
            <div class="why-num">03</div>
            <h3 class="why-claim">WE PRIORITIZE<br />QUALITY.</h3>
            <p class="why-detail">We believe strong creative work should be purposeful, relevant, and uncompromisingly aligned with the brand's premium tier.</p>
          </div>
          <div class="why-statement-item">
            <div class="why-num">04</div>
            <h3 class="why-claim">WE KEEP IT<br />PERSONAL.</h3>
            <p class="why-detail">Every client receives a dedicated, tailored leadership approach built around their specific commercial needs and long-term milestones.</p>
          </div>
          <div class="why-statement-item">
            <div class="why-num">05</div>
            <h3 class="why-claim">WE MEASURE<br />WHAT MATTERS.</h3>
            <p class="why-detail">Our reporting is built around real business analysis, tangible leads, and verifiable financial numbers—never vanity impressions or assumptions.</p>
          </div>
          <div class="why-statement-item">
            <div class="why-num">06</div>
            <h3 class="why-claim">WE BUILD<br />PARTNERSHIPS.</h3>
            <p class="why-detail">We aim for lasting, high-trust client relationships that support sustainable brand growth across decades of market evolution.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="clients-section" id="clients">
      <div class="container">
        <div class="clients-header">
          <span class="mono-tag" data-content="clients.tag">LOGOFOLIO & TRUST</span>
          <h2 class="clients-headline">
            <span data-content="clients.title">BRANDS WE’VE</span><br />
            <span class="text-gradient-purple" data-content="clients.titleAccent">WORKED WITH.</span>
          </h2>
        </div>
      </div>

      <div class="clients-marquee-wrap" aria-hidden="true">
        <div class="clients-marquee-track" id="clientsMarqueeTrack"></div>
      </div>

      <div class="container">
        <div class="clients-interactive-grid" id="clientsInteractiveGrid"></div>
      </div>
    </section>

    <section class="statement-section" id="creed">
      <div class="container">
        <div class="statement-box">
          <span class="mono-tag" style="margin-bottom: 24px;" data-content="statement.tag">THE ADVISOR CREED</span>
          <h2 class="statement-quote-large">
            <span data-content="statement.quote">“GOOD MARKETING GETS ATTENTION.</span><br />
            <span class="text-gradient-purple" data-content="statement.quoteAccent">GREAT MARKETING CREATES DIRECTION.”</span>
          </h2>
          <p class="statement-subquote" data-content="statement.subquote">
            YOUR BRAND DESERVES MORE THAN A CAMPAIGN.<br />
            IT DESERVES A STRATEGY.
          </p>
        </div>
      </div>
    </section>

    <section class="contact-section" id="contact">
      <div class="container">
        <div class="contact-layout-grid">
          <div class="contact-info-col">
            <div>
              <span class="mono-tag" style="margin-bottom: 20px;" data-content="contact.tag">INITIATE ENGAGEMENT</span>
              <h2 class="contact-headline">
                <span data-content="contact.title">LET’S CREATE</span><br />
                <span class="text-gradient-purple" data-content="contact.titleAccent">WHAT’S NEXT.</span>
              </h2>
              <p class="contact-philosophy" data-content="contact.philosophy">
                You dream. We strategize. We create.<br />
                Reality begins.
              </p>
            </div>

            <div class="contact-direct-card">
              <div class="direct-label" data-content="contact.phoneLabel">DIRECT PHONE / WHATSAPP</div>
              <a href="tel:01599990398" class="direct-phone-link" data-content-tel="contact.phone">
                <span data-content="contact.phone">01599990398</span>
                <span>↗</span>
              </a>
              <div class="direct-subtext" data-content="contact.officeNote">Office: Cairo, Egypt • Available Sunday – Thursday</div>
              <div style="margin-top: 16px;">
                <a href="https://wa.me/201599990398" target="_blank" rel="noopener noreferrer" class="btn-magnetic btn-outline" style="padding: 8px 18px; font-size: 0.75rem;">
                  <span data-content="contact.whatsappCta">Chat on WhatsApp</span>
                  <span>💬</span>
                </a>
              </div>
            </div>
          </div>

          <div class="contact-form-wrap">
            <h3 style="font-family: var(--font-display); font-size: clamp(1.15rem, 5.5vw, 1.5rem); font-weight: 800; text-transform: uppercase; margin-bottom: 24px; overflow-wrap: break-word;" data-content="contact.formTitle">
              START A PROJECT BRIEF
            </h3>

            <form id="projectInquiryForm">
              <div class="form-block">
                <label class="form-block-label">I'm interested in:</label>
                <div class="service-toggle-grid">
                  <button type="button" class="service-toggle-btn" data-service="Strategy & Direction">Strategy & Direction</button>
                  <button type="button" class="service-toggle-btn" data-service="Brand Creation">Brand Identity</button>
                  <button type="button" class="service-toggle-btn" data-service="Social Media">Social Media</button>
                  <button type="button" class="service-toggle-btn" data-service="Creative Production">Production</button>
                  <button type="button" class="service-toggle-btn" data-service="Photography">Photography</button>
                  <button type="button" class="service-toggle-btn" data-service="UI/UX & Web">UI/UX & Web</button>
                  <button type="button" class="service-toggle-btn" data-service="Packaging">Packaging</button>
                </div>
              </div>

              <div class="form-inputs-row">
                <div class="input-field-group">
                  <input type="text" id="clientName" class="custom-input" placeholder="Your Name *" required />
                </div>
                <div class="input-field-group">
                  <input type="email" id="clientEmail" class="custom-input" placeholder="Your Email *" required />
                </div>
              </div>

              <div class="form-inputs-row">
                <div class="input-field-group">
                  <input type="tel" id="clientPhone" class="custom-input" placeholder="Phone Number (e.g. 010...)" />
                </div>
                <div class="input-field-group">
                  <select id="clientBudget" class="custom-input" style="color: var(--text-white); background-color: #161524;">
                    <option value="">Estimated Budget (Optional)</option>
                    <option value="Under $5,000 / Under 250K EGP">&lt; $5,000 / &lt; 250,000 EGP</option>
                    <option value="$5,000 - $15,000 / 250K - 750K EGP">$5,000 – $15,000 / 250K – 750K EGP</option>
                    <option value="$15,000 - $35,000 / 750K - 1.7M EGP">$15,000 – $35,000 / 750K – 1.7M EGP</option>
                    <option value="$35,000+ / 1.7M+ EGP">$35,000+ / 1.7M+ EGP</option>
                  </select>
                </div>
              </div>

              <div class="input-field-group">
                <textarea id="clientBrief" class="custom-input" placeholder="Tell us about your brand, objectives, or timeline..."></textarea>
              </div>

              <button type="submit" class="btn-magnetic btn-primary form-submit-btn">
                <span>SUBMIT INQUIRY VIA WHATSAPP / DIRECT</span>
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
</main>
<?php
get_footer();
