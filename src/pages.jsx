import React, { useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import catalogue from "./catalogue.json";
const asset = (name) =>
  `${import.meta.env.BASE_URL}assets/${encodeURIComponent(name)}`;
const categories = [
  [
    "bikes",
    "Motorcycles",
    "Find your next ride.",
    "transparentBG gsxr1000white.png",
  ],
  ["gear", "Riding gear", "Ready for the road.", "transparentBG hjc i71.png"],
  [
    "accessories",
    "Accessories",
    "Make it your own.",
    "transparentBG headset.png",
  ],
];
function Button({ to, children, secondary = false }) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
    </Link>
  );
}
function Intro({ eyebrow = "UMPLEBY MOTORCYCLES", title, children }) {
  return (
    <div className="intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
function Categories() {
  return (
    <div className="grid categories">
      {categories.map(([slug, title, description, image], i) => (
        <Link className="category-card" to={`/${slug}`} key={slug}>
          <span className="eyebrow">0{i + 1} / THE COLLECTION</span>
          <img src={asset(image)} alt="" />
          <h3>
            {title} <span>↗</span>
          </h3>
          <p>{description}</p>
        </Link>
      ))}
    </div>
  );
}
function Home() {
  const heroRef = useRef(null);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const updateHeight = () => {
      const top = hero.getBoundingClientRect().top + window.scrollY;
      hero.style.setProperty("--hero-top", `${top}px`);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.querySelector("header"));
    observer.observe(document.querySelector(".trust-strip"));
    updateHeight();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <section className="hero" ref={heroRef}>
        <img
          className="hero-suzuki-banner"
          src={asset("suzuki banner.png")}
          alt="Suzuki"
        />
        <div className="hero-copy">
          <h1>
            Suzuki motorcycles.
            <br />
            <em>Expert care.</em>
          </h1>
          <p>
            The solution to all your moto needs. Discover Suzuki motorcycles,
            quality riding gear, and care from people who ride.
          </p>
          <div className="actions">
            <Button to="/bikes">Explore motorcycles ↗</Button>
            <Button to="/bookings" secondary>
              Book a service
            </Button>
          </div>
        </div>
        <div className="hero-bike">
          <img
            src={asset("transparentBG gsxr1000white.png")}
            alt="White Suzuki GSX-R motorcycle"
          />
          <div className="bike-caption">
            <span>GSX-R / SUZUKI</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR WAY</span>
            <h2>Everything for the ride.</h2>
          </div>
          <Link to="/store">Browse the catalogue ↗</Link>
        </div>
        <Categories />
      </section>
      <section className="workshop">
        <img
          src={asset("workshop.jpg")}
          alt="Umpleby motorcycle workshop"
          loading="lazy"
        />
        <div>
          <span className="eyebrow">LOOK AFTER YOUR RIDE</span>
          <h2>
            Good hands.
            <br />
            Great journeys.
          </h2>
          <p>
            From routine servicing to diagnostics and repairs, our team keeps
            your motorcycle ready for the road with technical expertise and
            genuine Suzuki parts.
          </p>
          <Button to="/bookings">Request a workshop booking ↗</Button>
        </div>
      </section>
    </>
  );
}
function ProductImage({ name, image }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="image-fallback">Image coming soon</div>
  ) : (
    <img
      src={asset(image)}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
function Catalogue({ type }) {
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(false);
  const products = catalogue[type].filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (!available || !/unavailable|out of stock/i.test(p.status)),
  );
  return (
    <section className="section">
      <Intro title={categories.find((c) => c[0] === type)[1]}>
        Explore our collection. Contact our team to confirm current pricing and
        availability.
      </Intro>
      <div className="catalogue-tabs">
        {categories.map((c) => (
          <NavLink to={`/${c[0]}`} key={c[0]}>
            {c[1]}
          </NavLink>
        ))}
      </div>
      <div className="filters">
        <label className="search">
          Search the collection
          <input
            type="search"
            placeholder="Search by model or product…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />{" "}
          Hide unavailable items
        </label>
        <span>{products.length} results</span>
      </div>
      <div className="grid products">
        {products.map((p) => (
          <article className="product" key={p.id}>
            <ProductImage {...p} />
            <div className="product-body">
              <span
                className={`stock ${/unavailable|out of stock/i.test(p.status) ? "muted" : ""}`}
              >
                {p.status}
              </span>
              <h2>{p.name}</h2>
              <div className="product-bottom">
                <span>
                  {type === "bikes" ? `Model year ${p.price}` : p.price}
                </span>
                <Link to={`/contact?product=${encodeURIComponent(p.name)}`}>
                  Enquire ↗
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!products.length && (
        <div className="panel">
          No products match your search.{" "}
          <button
            onClick={() => {
              setQuery("");
              setAvailable(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
function Hours() {
  return (
    <dl className="hours">
      <div>
        <dt>Monday – Friday</dt>
        <dd>07:30 – 16:30</dd>
      </div>
      <div>
        <dt>Saturday</dt>
        <dd>07:30 – 11:30</dd>
      </div>
      <div>
        <dt>Sunday</dt>
        <dd>Closed</dd>
      </div>
    </dl>
  );
}
function Contact() {
  const location = useLocation();
  const product = new URLSearchParams(location.search).get("product");
  return (
    <section className="section">
      <Intro title="Let's talk motorcycles.">
        Questions about a bike, your next service, or the right gear? Get in
        touch with our team.
      </Intro>
      {product && (
        <div className="notice">
          Your enquiry: <strong>{product}</strong>
        </div>
      )}
      <div className="grid contact-grid">
        <div className="panel">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>We're here to help.</h2>
          <a className="contact-link" href="tel:+27313038323">
            031 303 8323 <small>Call the dealership ↗</small>
          </a>
          <a
            className="contact-link"
            href={`https://wa.me/27827029500${product ? "?text=" + encodeURIComponent("Hello, I would like to enquire about " + product) : ""}`}
          >
            082 702 9500 <small>Chat on WhatsApp ↗</small>
          </a>
          <a
            className="contact-link"
            href={`mailto:admin@motocycle.co.za${product ? "?subject=" + encodeURIComponent("Enquiry: " + product) : ""}`}
          >
            admin@motocycle.co.za <small>Email our team ↗</small>
          </a>
          <div className="socials">
            <a href="https://www.instagram.com/umpleby_motorcycles/">
              Instagram ↗
            </a>
            <a href="https://www.facebook.com/144499442309743/">Facebook ↗</a>
            <a href="https://za.linkedin.com/company/suzuki-durban-umpleby-motorcycles">
              LinkedIn ↗
            </a>
          </div>
        </div>
        <div className="panel">
          <span className="eyebrow">PLAN YOUR VISIT</span>
          <h2>Find us in Durban.</h2>
          <Hours />
          <Link to="/location">View location & directions ↗</Link>
        </div>
      </div>
    </section>
  );
}
function About() {
  return (
    <section className="section">
      <Intro title="Riders at heart.">
        Your local motorcycle people, with a passion for every journey.
      </Intro>
      <div className="split">
        <img
          className="feature-image"
          src={asset("beach view.jpg")}
          alt="Durban's coastal scenery"
        />
        <div className="panel">
          <span className="eyebrow">OUR STORY</span>
          <h2>
            A new chapter.
            <br />
            The same passion.
          </h2>
          <p>
            Umpleby Motorcycles is an authorised Suzuki Motorcycles dealership.
            Originally established as Suzuki Durban, we have undergone a change
            in ownership and a refreshing rebrand.
          </p>
          <p>
            We specialise in high-quality motorcycle care and maintenance, with
            a focus on genuine Suzuki parts, technical expertise, and customer
            support.
          </p>
          <h3>Meet Jarred Umpleby</h3>
          <p>
            Owner, husband, and father to Isla and Roarke. A biker himself,
            Jarred brings a passion for the industry shaped by a 23-year
            professional motocross career.
          </p>
          <a href="https://www.instagram.com/jarredumps/">Meet Jarred ↗</a>
        </div>
      </div>
    </section>
  );
}
function Forms() {
  return (
    <section className="section">
      <Intro title="A little paperwork. A lot of possibility.">
        Get started with your finance application.
      </Intro>
      <div className="grid">
        <div className="panel">
          <span className="eyebrow">PRIVATE FINANCE</span>
          <h2>Finance application</h2>
          <p>Download the application to complete your details.</p>
          <a
            className="button"
            href={asset("Finance form for Private.pdf")}
            download
          >
            Download PDF ↓
          </a>
        </div>
        <div className="panel">
          <span className="eyebrow">GET PREPARED</span>
          <h2>Required documents</h2>
          <p>Review the supporting documents for private finance.</p>
          <a
            className="button secondary"
            href={asset("Required documents for Private Finance.docx")}
            download
          >
            Download checklist ↓
          </a>
        </div>
        <div className="panel">
          <span className="eyebrow">COMPANY APPLICATIONS</span>
          <h2>Let's get you started</h2>
          <p>
            Contact our team for company finance and credit application forms.
          </p>
          <Button to="/contact">Contact the team ↗</Button>
        </div>
      </div>
    </section>
  );
}
function Faqs() {
  return (
    <section className="section narrow">
      <Intro title="Good questions. Clear answers.">
        Helpful information before your next ride.
      </Intro>
      {catalogue.faqs.map((f) => (
        <details key={f.question}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
          <Link to="/contact">Talk to our team ↗</Link>
        </details>
      ))}
      <p>
        <Link to="/forms">Finance forms & required documents ↗</Link>
      </p>
    </section>
  );
}
const bookingTypes = [
  "Service, under warranty",
  "Service, not under warranty",
  "General repairs",
  "Repairs, accident damage",
  "Check-up",
  "Tyre puncture, plug",
  "New tyre fitment, loose wheel",
  "New tyre fitment, on bike",
  "Diagnostic assessment",
  "Battery, charge",
  "Battery, replacement",
  "Other",
];
const defaultEndpoint =
  "https://script.google.com/macros/s/AKfycbw6wCvSB6F6nwjgxZmzmXZCCR-3OsfKDG5y9H0AEExakFp8_3FgUlBAB0NXa_DEygQsVA/exec";
function Booking() {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const now = new Date();
  const minimum = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  async function submit(e) {
    e.preventDefault();
    if (submitting.current) return;
    const form = e.currentTarget;
    const body = new FormData(form);
    if (new Date(body.get("dateTime")) < new Date()) {
      setState("error");
      setMessage("Please choose a future date and time.");
      return;
    }
    submitting.current = true;
    setState("sending");
    setMessage("Sending your request…");
    try {
      const response = await fetch(
        import.meta.env.VITE_BOOKING_ENDPOINT || defaultEndpoint,
        { method: "POST", body, signal: AbortSignal.timeout(20000) },
      );
      if (!response.ok) throw Error();
      const data = await response.json();
      if (data.result !== "success") throw Error();
      setState("success");
      setMessage(
        "Thank you! Your request has been sent. Please wait for our team to confirm your booking.",
      );
      form.reset();
    } catch {
      setState("error");
      setMessage(
        "We could not confirm receipt of your request. Please call 031 303 8323 before trying again.",
      );
    } finally {
      submitting.current = false;
    }
  }
  const field = (name, label, type = "text", required = true, extra = {}) => (
    <label key={name}>
      {label}
      {required ? " *" : ""}
      <input name={name} type={type} required={required} {...extra} />
    </label>
  );
  return (
    <section className="section">
      <Intro title="Keep your ride ready.">
        Request a workshop booking. Our team will confirm availability with you.
      </Intro>
      <div className="booking-layout">
        <aside className="panel">
          <span className="eyebrow">THE WORKSHOP</span>
          <h2>Care you can count on.</h2>
          <p>
            Have your VIN ready so we can provide accurate parts and pricing.
          </p>
          <Hours />
          <p>
            Need help? <a href="tel:+27313038323">031 303 8323</a>
          </p>
          <Link to="/faqs">Frequently asked questions ↗</Link>
        </aside>
        <form className="panel" onSubmit={submit}>
          <p className="form-note">Fields marked * are required.</p>
          <fieldset disabled={state === "sending"}>
            <legend>01 / Your details</legend>
            <div className="field-grid">
              {field("firstName", "First name(s)", "text", true, {
                autoComplete: "given-name",
              })}
              {field("lastName", "Last name", "text", true, {
                autoComplete: "family-name",
              })}
              {field("cellNumber", "Cell number", "tel", true, {
                autoComplete: "tel",
              })}
              {field("email", "Email address", "email", true, {
                autoComplete: "email",
              })}
            </div>
          </fieldset>
          <fieldset disabled={state === "sending"}>
            <legend>02 / Your motorcycle</legend>
            <div className="field-grid">
              {field("make", "Make", "text", true, { list: "makes" })}
              {field("model", "Model")}
              {field("vin", "VIN number")}
              {field("mileage", "Mileage (km)", "number", false, { min: 0 })}
            </div>
            <datalist id="makes">
              {[
                "Suzuki",
                "Honda",
                "Yamaha",
                "Kawasaki",
                "BMW Motorrad",
                "Aprilia",
                "Ducati",
                "Harley-Davidson",
                "Indian Motorcycle",
                "KTM",
                "Royal Enfield",
                "Triumph",
              ].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </datalist>
          </fieldset>
          <fieldset disabled={state === "sending"}>
            <legend>03 / Your booking</legend>
            <label>
              Type of booking *
              <select name="bookingType" required defaultValue="">
                <option value="" disabled>
                  Select a service
                </option>
                {bookingTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {field(
              "dateTime",
              "Preferred date and time",
              "datetime-local",
              true,
              { min: minimum },
            )}
            <p className="form-note">
              This is a request, subject to workshop availability.
            </p>
            <label className="checkbox">
              <input type="checkbox" required /> I understand that my booking
              must be confirmed by the team.
            </label>
          </fieldset>
          <button
            className="button"
            type="submit"
            disabled={state === "sending"}
          >
            {state === "sending" ? "Sending…" : "Send booking request ↗"}
          </button>
          <p
            role="status"
            aria-live="polite"
            className={`form-status ${state}`}
          >
            {message}
          </p>
        </form>
      </div>
    </section>
  );
}

export {
  asset,
  categories,
  Button,
  Intro,
  Categories,
  Home,
  Catalogue,
  Hours,
  Contact,
  About,
  Forms,
  Faqs,
  Booking,
};
