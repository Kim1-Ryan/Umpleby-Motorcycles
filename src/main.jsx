import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
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
} from "./pages";
import "./styles.css";
function App() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
    document.title = `${location.pathname === "/" ? "Durban Suzuki dealership" : location.pathname.slice(1).replace(/^./, (c) => c.toUpperCase())} | Umpleby Motorcycles`;
  }, [location.pathname]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main.focus();
          main.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      {location.pathname === "/" && (
        <div className="trust-strip">
          <span>Authorised Suzuki dealership</span>
          <span>Genuine Suzuki parts</span>
          <span>Workshop expertise</span>
        </div>
      )}
      <header>
        <Link className="brand" to="/" aria-label="Umpleby Motorcycles home">
          <img src={asset("logo.png")} alt="" />
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-line">
              {[..."UMPLEBY"].map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </span>
            <small className="brand-line">
              {[..."MOTORCYCLES"].map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={menu}
          aria-controls="navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close ✕" : "Menu ☰"}
        </button>
        <nav
          id="navigation"
          className={menu ? "open" : ""}
          aria-label="Main navigation"
        >
          {[
            ["/", "Home"],
            ["/store", "Our collection"],
            ["/about", "About us"],
            ["/contact", "Contact"],
          ].map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
          <Button to="/bookings">Book a service</Button>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/store"
            element={
              <section className="section">
                <Intro title="Find your next adventure.">
                  Motorcycles, gear and accessories. All in one place.
                </Intro>
                <Categories />
              </section>
            }
          />
          {categories.map((c) => (
            <Route
              key={c[0]}
              path={`/${c[0]}`}
              element={<Catalogue key={c[0]} type={c[0]} />}
            />
          ))}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route
            path="/hours"
            element={
              <section className="section narrow">
                <Intro title="Time for a visit." />
                <div className="panel">
                  <Hours />
                  <Button to="/bookings">Request a booking ↗</Button>
                </div>
              </section>
            }
          />
          <Route
            path="/location"
            element={
              <section className="section">
                <Intro title="Come visit us.">
                  Find Umpleby Motorcycles in Durban, KwaZulu-Natal.
                </Intro>
                <div className="split">
                  <img
                    className="feature-image"
                    src={asset("map snippet.png")}
                    alt="Map showing the dealership location"
                  />
                  <div className="panel">
                    <h2>We'll see you in Durban.</h2>
                    <Hours />
                    <div className="actions">
                      <a className="button" href="https://shorturl.at/cdD1d">
                        Get directions ↗
                      </a>
                      <a
                        className="button secondary"
                        href="https://shorturl.at/HH9AL"
                      >
                        View map ↗
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            }
          />
          <Route
            path="*"
            element={
              <section className="section">
                <Intro title="This road doesn't lead anywhere." />
                <Button to="/">Back to home</Button>
              </section>
            }
          />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer>
        <div className="footer-top">
          <div>
            <h2>See you on the road.</h2>
            <p>The solution to all your moto needs.</p>
          </div>
          <img src={asset("suzuki banner.png")} alt="Suzuki" />
        </div>
        <div className="footer-links">
          {[
            ["about", "About"],
            ["forms", "Finance forms"],
            ["hours", "Opening hours"],
            ["location", "Find us"],
            ["faqs", "FAQs"],
            ["contact", "Contact"],
          ].map(([slug, label]) => (
            <Link key={slug} to={`/${slug}`}>
              {label}
            </Link>
          ))}
          <a href="https://surl.lu/hjxhdz">Review us ↗</a>
          <a
            className="footer-suzuki-link"
            href="https://suzukimotorcycle.co.za"
          >
            Suzuki SA ↗
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Umpleby Motorcycles (Pty) Ltd
          </span>
          <span>Durban, KwaZulu-Natal</span>
        </div>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
