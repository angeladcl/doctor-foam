const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// The new prices
content = content.replace(/price: "\$17,999"/, 'price: "$14,999"');
content = content.replace(/pickupPrice: "\$20,699"/, 'pickupPrice: "$17,249"');

// 1. Extract HERO (lines starting with {/* ─── HERO ─── */} up to {/* ─── SERVICES ─── */})
const heroStart = content.indexOf('{/* ─── HERO ─── */}');
const servicesStart = content.indexOf('{/* ─── SERVICES ─── */}');
const heroChunk = content.slice(heroStart, servicesStart);

// 2. Extract SERVICES (Nuestros Paquetes)
// From {/* ─── SERVICES ─── */} up to {/* ─── Subscription Plans ─── */}
const subsStart = content.indexOf('{/* ─── Subscription Plans ─── */}');
const servicesChunkRaw = content.slice(servicesStart, subsStart);
// But wait, the section doesn't close here. It closes after subscription plans.
// Let's close the services section here explicitly.
const servicesChunk = servicesChunkRaw + '\n      </section>\n\n';

// 3. Extract Subscription Plans (Pago recurrente)
// From {/* ─── Subscription Plans ─── */} up to {/* ─── PRICING ─── */}
const pricingStart = content.indexOf('{/* ─── PRICING ─── */}');
const subsChunkRaw = content.slice(subsStart, pricingStart);
// Since it was inside <section id="servicios">, we need to wrap it in its own <section> 
const subsChunkWrapper = `      {/* ─── RECURRENTE ─── */}
      <section className="section-padding" id="recurrente">
        <div className="container" style={{ textAlign: "center" }}>
${subsChunkRaw}      </section>\n\n`;
// Remove extra </div></div></section> that was at the end of the original services
const subsChunkCleanEndPattern = /<\/div>\s*<\/section>\s*$/;
let cleanedSubs = subsChunkWrapper.replace(/<\/div>\s*<\/div>\s*<\/section>\s*$/, '      </section>\n\n');
// wait, examining the file, at the end of pricing/subscription there is:
//             </div>
//           </div>
//         </div>
//       </section>
// We can just rely on AST or simple string replacement.

// A safer string replacement is to replace the whole <main> or return() block.
// Let's just use string replacement on the whole layout:
// Original Order:
// HERO
// SERVICES (includes Subscription)
// PRICING
// ZONES
// PROCESS
// REVIEWS
// FAQ
// CONTACT/CTA
// FOOTER (is not in this file? No, Footer is likely at the bottom or separate. Actually looking closely at line 640 of page.tsx, it's just `<div style={{ marginTop: "3rem" }}>`)

// Let's use regular expressions to extract blocks.
function getBlock(nameStart, nameEnd) {
    let start = content.indexOf(nameStart);
    let end = nameEnd ? content.indexOf(nameEnd) : content.length;
    return content.slice(start, end);
}

const beforeHero = content.slice(0, content.indexOf('{/* ─── HERO ─── */}'));
const hero = getBlock('{/* ─── HERO ─── */}', '{/* ─── SERVICES ─── */}');
const servicesHTML = getBlock('{/* ─── SERVICES ─── */}', '{/* ─── PRICING ─── */}');
const pricing = getBlock('{/* ─── PRICING ─── */}', '{/* ─── COVERAGE ZONES ─── */}');
const zones = getBlock('{/* ─── COVERAGE ZONES ─── */}', '{/* ─── PROCESS ─── */}');
const processSteps = getBlock('{/* ─── PROCESS ─── */}', '{/* ─── GOOGLE REVIEWS ─── */}');
const reviews = getBlock('{/* ─── GOOGLE REVIEWS ─── */}', '{/* ─── FAQ ─── */}');
const faqAndRest = getBlock('{/* ─── FAQ ─── */}', null);

// Split servicesHTML into 'servicios' horizontal cards and 'subscription plans'
const splitSubs = servicesHTML.split('{/* ─── Subscription Plans ─── */}');
let serviciosCards = splitSubs[0] + '        </div>\n      </section>\n\n';
let subscriptionPlans = '      {/* ─── PAGO RECURRENTE ─── */}\n      <section className="section-padding" id="recurrente">\n        <div className="container" style={{ textAlign: "center" }}>\n          {/* ─── Subscription Plans ─── */}' + splitSubs[1];

// Insert Blog Carousel into reviews
const blogCarouselStr = `
      {/* ─── BLOG CAROUSEL ─── */}
      <section className="section-padding" id="blog" style={{ background: "#ffffff" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="animate-on-scroll">
            <span className="section-label">Aprende con Nosotros</span>
            <h2 className="section-title">
              Últimos artículos del <span className="gradient-text">Blog</span>
            </h2>
          </div>

          <div style={{ 
            display: "flex", 
            gap: "2rem", 
            overflowX: "auto", 
            paddingBottom: "2rem", 
            marginTop: "3rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
            {/* Array is mapped over statically to prevent build errors since it's a client component */}
            {[
              { slug: "guia-completa-recubrimiento-ceramico", title: "Guía Completa: Recubrimiento Cerámico en CDMX", cat: "Protección" },
              { slug: "5-errores-lavado-auto-premium", title: "5 Errores que Arruinan la Pintura de tu Auto", cat: "Cuidado" },
              { slug: "detallado-interior-profundo-que-incluye", title: "¿Qué Incluye un Detallado Interior Profundo?", cat: "Servicios" },
              { slug: "correccion-pintura-swirls-guia", title: "Cómo Eliminar Swirls y Micro-rayones", cat: "Corrección" },
              { slug: "por-que-detallado-domicilio-mejor", title: "¿Por Qué el Detallado a Domicilio Supera al Taller?", cat: "Tendencias" },
              { slug: "mejores-ceras-selladores-mexico", title: "Las Mejores Ceras y Selladores en México", cat: "Productos" }
            ].map((b, i) => (
              <a key={i} href={\`/blog/\${b.slug}\`} className="glass-card animate-on-scroll" style={{ 
                minWidth: "320px", 
                maxWidth: "320px",
                flexShrink: 0,
                textAlign: "left",
                textDecoration: "none",
                display: "block",
                overflow: "hidden"
              }}>
                <div style={{ height: "200px", backgroundImage: \`url(/blog/\${b.slug}.png)\`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ padding: "1.5rem" }}>
                  <span className="zone-tag zone-tag-gold" style={{ marginBottom: "0.5rem" }}>{b.cat}</span>
                  <h3 style={{ fontSize: "1.1rem", color: "#0f172a", marginTop: "0.5rem" }}>{b.title}</h3>
                  <p style={{ color: "var(--color-gold-400)", fontSize: "0.85rem", marginTop: "1rem", fontWeight: 600 }}>Leer artículo →</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
`;

let newOrder = beforeHero +
    hero +
    pricing +
    serviciosCards +
    subscriptionPlans +
    zones +
    processSteps +
    reviews +
    blogCarouselStr +
    faqAndRest;

fs.writeFileSync(pagePath, newOrder, 'utf8');
console.log("Successfully entirely refactored page.tsx !");
