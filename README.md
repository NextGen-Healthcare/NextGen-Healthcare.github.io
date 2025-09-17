# NextGen Healthcare Network Website


Static, accessible website for the NextGen Healthcare Network. Built with vanilla HTML/CSS/JS for easy hosting on GitHub Pages.


## 🚀 Quick start


1. **Create repo** on GitHub named `nextgen-healthcare-network-website` (or any name).
2. Copy this folder structure into the repo.
3. Commit & push.
4. In **Settings → Pages**, set:
- **Source**: `Deploy from a branch`
- **Branch**: `main` (or `gh-pages`) / root
5. Visit the published URL shown by GitHub.


> Custom domain? Add your domain to **Settings → Pages** and put the same domain in the `CNAME` file.


## 🗓 Managing events


- Edit `/assets/js/events.js` — add, remove, or update event objects.
- Categories: `coffee | iheem | all-network | drinks`.
- Dates use `YYYY-MM-DD` for sorting.


## 📨 Forms (Join / Contact)


The forms use [Formspree](https://formspree.io/):
- Replace `https://formspree.io/f/your-form-id` with your form endpoint.
- Or swap the `action` with a `mailto:hello@...` link if you prefer email only.


## 🎨 Colours


Palette variables are defined in `assets/css/style.css` (from your Lovable prompt). To tweak, edit the `:root` variables.


## 🔎 SEO & Accessibility


- Semantic HTML5, labelled controls, skip link, high‑contrast palette.
- `sitemap.xml`, `robots.txt`, and Open Graph tags included.


## ♿ Keyboard & Mobile


- Mobile nav toggle is keyboard‑accessible and ARIA‑labelled.
- Responsive grids collapse gracefully.


## 🛠 Local preview


You can open `index.html` directly, or run a simple server:


```bash
python3 -m http.server 8000
# then browse http://localhost:8000
