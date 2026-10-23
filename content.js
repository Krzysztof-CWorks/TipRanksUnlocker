/*
 * TipRanks Unlocker — content script
 *
 * Usuwa nakładkę paywall ("You've reached your limit of free investment research")
 * oraz przywraca przewijanie strony, które TipRanks blokuje pod nakładką.
 *
 * Strona jest aplikacją SPA i wstrzykuje nakładkę dynamicznie (oraz potrafi ją
 * wstawiać ponownie), dlatego używamy MutationObserver zamiast jednorazowego usunięcia.
 */
(function () {
  "use strict";

  // Tekst-sygnatura nakładki (odporny na zmiany klas CSS).
  const SIGNATURE_TEXT = "reached your limit of free investment research";

  // Selektory strukturalne: pełnoekranowy overlay z półprzezroczystym tłem.
  const OVERLAY_SELECTOR = [
    "div.positionabsolute.anchorall.bgAlpha90",
    // Wariant z animacją wjazdu: "bgblack flexcsc w12 px3 displayflex positionabsolute
    // h12 anchorall bgAlpha90 z3 animationgoUp filtershadow"
    "div.bgblack.anchorall.animationgoUp.filtershadow",
  ].join(", ");

  function isOverlay(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (el.matches && el.matches(OVERLAY_SELECTOR)) return true;
    // Zapasowo: dopasowanie po tekście, gdyby klasy się zmieniły.
    if (
      el.classList &&
      el.classList.contains("positionabsolute") &&
      el.classList.contains("anchorall") &&
      el.textContent &&
      el.textContent.toLowerCase().includes(SIGNATURE_TEXT)
    ) {
      return true;
    }
    return false;
  }

  function removeOverlays(root) {
    // 1. Dopasowanie po selektorze klas.
    let found = false;
    root.querySelectorAll &&
      root.querySelectorAll(OVERLAY_SELECTOR).forEach((el) => {
        el.remove();
        found = true;
      });

    // 2. Zapasowo: szukamy po tekście-sygnaturze i usuwamy kontener overlay.
    if (!found && root.querySelectorAll) {
      root.querySelectorAll("div.positionabsolute.anchorall").forEach((el) => {
        if (
          el.textContent &&
          el.textContent.toLowerCase().includes(SIGNATURE_TEXT)
        ) {
          el.remove();
          found = true;
        }
      });
    }

    if (found) restoreScroll();
    return found;
  }

  function restoreScroll() {
    [document.documentElement, document.body].forEach((el) => {
      if (!el) return;
      el.classList.remove("noScroll");
      if (el.style && el.style.overflow === "hidden") {
        el.style.overflow = "";
      }
      el.style.removeProperty("position");
    });
  }

  // Wstępne czyszczenie, gdy DOM jest już częściowo dostępny.
  removeOverlays(document);

  // Obserwujemy dalsze zmiany DOM (SPA wstrzykuje nakładkę po załadowaniu).
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (isOverlay(node)) {
          node.remove();
          restoreScroll();
        } else if (node instanceof HTMLElement) {
          removeOverlays(node);
        }
      }
      // Klasa noScroll może zostać dodana do <html>/<body> bez nowych węzłów.
      if (
        m.type === "attributes" &&
        m.target instanceof HTMLElement &&
        m.target.classList.contains("noScroll")
      ) {
        restoreScroll();
      }
    }
  });

  function startObserver() {
    const target = document.documentElement || document.body;
    if (!target) {
      requestAnimationFrame(startObserver);
      return;
    }
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  }

  startObserver();

  // Dodatkowe czyszczenie po pełnym załadowaniu strony.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => removeOverlays(document));
  }
  window.addEventListener("load", () => removeOverlays(document));
})();
