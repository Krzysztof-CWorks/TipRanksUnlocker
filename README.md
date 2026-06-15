# TipRanks Unlocker

Wtyczka przeglądarki (Manifest V3) dla **Microsoft Edge** i **Google Chrome**.
Działa na stronach `https://www.tipranks.com/stocks/*` i ukrywa/usuwa nakładkę
paywall:

> *„You've reached your limit of free investment research”*

Przywraca także przewijanie strony, które TipRanks blokuje pod nakładką.

## Jak to działa

- **`styles.css`** — ukrywa nakładkę natychmiast (przy `document_start`), więc
  nie ma migotania.
- **`content.js`** — usuwa nakładkę z DOM i pilnuje jej ponownego pojawienia się
  za pomocą `MutationObserver` (TipRanks to aplikacja SPA i wstrzykuje nakładkę
  dynamicznie). Dopasowanie działa po klasach CSS oraz zapasowo po tekście, więc
  jest odporne na drobne zmiany na stronie.

## Instalacja (tryb dewelopera)

### Microsoft Edge
1. Otwórz `edge://extensions/`.
2. Włącz **Tryb dewelopera** (przełącznik po lewej).
3. Kliknij **Załaduj rozpakowane** i wskaż folder `C:\CWorks\TipRanksUnlocker`.

### Google Chrome
1. Otwórz `chrome://extensions/`.
2. Włącz **Tryb dewelopera** (przełącznik w prawym górnym rogu).
3. Kliknij **Załaduj rozpakowane** i wskaż folder `C:\CWorks\TipRanksUnlocker`.

Po instalacji odśwież dowolną stronę `tipranks.com/stocks/...`.

## Struktura plików

```
TipRanksUnlocker/
├── manifest.json     # konfiguracja wtyczki (MV3)
├── content.js        # logika usuwania nakładki + odblokowanie przewijania
├── styles.css        # natychmiastowe ukrycie nakładki (bez migotania)
├── icons/            # ikony 16/48/128 px
└── README.md
```

## Uwagi

Jeśli TipRanks zmieni strukturę HTML i nakładka znów się pojawi, najczęściej
wystarczy zaktualizować selektor `OVERLAY_SELECTOR` w `content.js` oraz regułę
w `styles.css`.
