<div align="center">

# ⚡ Pokédex Web App

### A feature-rich Pokédex built with Vanilla JavaScript and PokéAPI

Search, explore, compare, build teams, track progress, and inspect detailed Pokémon data in a responsive web interface.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)
![PokéAPI](https://img.shields.io/badge/Pok%C3%A9API-EF5350?style=for-the-badge&logo=pokemon&logoColor=white)

</div>

---

## 📖 About the Project

This project is an interactive **Pokédex web application** powered by [PokéAPI](https://pokeapi.co/).

It goes beyond a basic Pokémon list by providing searching, filtering, detailed Pokémon information, favorites, Pokémon comparison, team building, progress tracking, a lightweight battle prediction tool, competitive build suggestions, dark mode, and English/Japanese language support.

The application is written with **HTML, CSS, and Vanilla JavaScript**, with no build framework required.

---

## ✨ Features

### 🔎 Pokémon Search & Filtering

- Search Pokémon by **name or Pokédex ID**.
- Filter by all **18 Pokémon types**.
- Filter by **Generation 1–9**.
- View **special forms** separately.
- Sort by:
  - ID ascending
  - ID descending
  - Name A–Z
  - Name Z–A
  - Favorites
- Result counter updates automatically after filtering.
- Loads Pokémon progressively for better browsing performance.

### 📚 Detailed Pokémon Information

Selecting a Pokémon opens a detailed information panel with multiple tabs:

#### About
- Pokédex entry / description
- Height
- Weight
- Abilities
- Generation
- Habitat
- Capture rate
- Base experience
- Egg group
- Growth rate
- Gender ratio
- Pokémon category
- Type weaknesses

#### Stats
Displays the six main base stats:

- HP
- Attack
- Defense
- Special Attack
- Special Defense
- Speed
- Total base stat value

#### Evolution
- Displays the Pokémon evolution chain.
- Shows evolution stages and available level information.

#### Moves
- Displays a list of Pokémon moves.
- Prioritizes level-up move information when available.
- Click a move to open a detailed modal.
- Move details include:
  - Power
  - Accuracy
  - PP
  - Priority
  - Damage class
  - Target
  - Effect description

#### Competitive Build
The app generates a lightweight recommendation based on Pokémon stats and characteristics, including:

- Recommended role
- Nature
- Ability
- Suggested item
- EV focus
- Suggested moves
- Play-style advice

> Competitive build suggestions are generated using simple application heuristics and are intended as a helpful reference, not as official competitive Pokémon strategy.

---

## ❤️ Favorites

- Add or remove Pokémon from favorites directly from a Pokémon card or detail view.
- Filter the Pokédex to display favorites only.
- Favorites are saved using **Local Storage**, so they remain available after refreshing the browser.

---

## ⚖️ Pokémon Comparison

The comparison system lets you select two Pokémon and view their information side by side.

Useful for quickly comparing:

- Base stats
- Types
- Strength differences
- Pokémon characteristics

Pokémon can be added to comparison directly from the list or detail panel.

---

## 👥 Team Builder

Build a Pokémon team of up to **6 Pokémon**.

The Team Builder provides:

- Six team slots
- Add/remove Pokémon
- Team type overview
- Shared weakness analysis
- Resistance analysis
- Type coverage
- Team balance score
- Basic team-building advice

Team selections are stored in **Local Storage**.

---

## 📈 Pokédex Progress

The Progress panel tracks your activity inside the application, including:

- Pokémon seen
- Favorites saved
- Current team size
- Special forms seen
- Pokédex completion percentage
- Total Pokémon loaded

Seen Pokémon data is also persisted locally in the browser.

---

## ⚔️ Battle Simulator Lite

Choose two Pokémon and run a lightweight battle prediction.

The prediction considers:

- Total base stats
- Speed
- Type advantage

The application displays an estimated percentage for each Pokémon and predicts a winner.

> **Note:** Battle Simulator Lite is not a complete Pokémon battle engine. It does not simulate moves, abilities, held items, status conditions, EVs/IVs, weather, terrain, or full competitive mechanics.

---

## 🎲 Random Pokémon

Use the **Random** button to instantly open a randomly selected Pokémon from the loaded Pokédex.

---

## 🌙 Dark Mode

The application supports both:

- ☀️ Light Mode
- 🌙 Dark Mode

The selected theme is automatically saved in **Local Storage**.

---

## 🌐 Language Support

The interface supports:

- 🇺🇸 English
- 🇯🇵 Japanese

Pokémon names, descriptions, types, abilities, and supported API text are localized when PokéAPI provides the corresponding Japanese data.

The selected language is stored in the browser and restored on the next visit.

---

## 📱 Responsive Design

The interface adapts to different screen sizes, including desktop and smaller/mobile displays.

On smaller screens, Pokémon details are displayed using a responsive overlay-style layout for easier navigation.

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| **HTML5** | Application structure |
| **CSS3** | Layout, responsive design, animations and themes |
| **JavaScript (ES6+)** | API calls, filtering, UI logic and application features |
| **PokéAPI** | Pokémon, species, type, evolution, move and ability data |
| **Local Storage** | Theme, language, favorites, seen Pokémon and teams |
| **Font Awesome** | Interface icons |

No JavaScript framework or package manager is required.

---

## 🔌 API

The project uses the public **PokéAPI** REST API:

```text
https://pokeapi.co/api/v2/
```

Examples of resources used by the application include:

```text
/pokemon/
/pokemon-species/
/type/
/evolution-chain/
/move/
/ability/
```

Pokémon data is fetched dynamically from the API when the application runs.

---

## 📁 Project Structure

```text
.
├── index.html
├── style.css
├── javascript/
│   ├── setup.js
│   ├── pokemon-list.js
│   └── pokemon-info.js
└── src/
    ├── arrow-up-icon.png
    ├── close-icon.png
    ├── no-pokemon-selected-image.png
    └── pokeball-icon.png
```

### JavaScript files

- **`setup.js`** — application initialization, PokéAPI list/type loading, theme and language settings.
- **`pokemon-list.js`** — Pokémon list rendering, searching, filters, sorting, favorites and progress tracking.
- **`pokemon-info.js`** — Pokémon detail data, stats, weaknesses, moves, evolution, comparison, team builder, competitive build and Battle Simulator Lite.

---

## 🚀 Run Locally

### 1. Download or clone the project

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Start a local web server

Because the application loads data from external APIs, running it through a local development server is recommended.

If you use **VS Code**, you can install the **Live Server** extension and then:

```text
Right click index.html → Open with Live Server
```

Or use Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No `npm install` or build command is required.

---

## 🌍 Deploy on GitHub Pages

This project is a static frontend application, so it can be hosted directly with GitHub Pages.

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your main branch and `/(root)`.
5. Save the configuration.
6. Wait for GitHub Pages to publish the website.

Make sure `index.html` is located in the selected publishing directory.

---

## 💾 Browser Storage

The application stores the following user preferences locally:

```text
pokedexTheme
pokedexLanguage
favoritePokemonIds
seenPokemonIds
teamPokemonIds
```

This information stays on the user's device through the browser's Local Storage and does not require a database or user account.

---

## ⚠️ Notes

- An internet connection is required because Pokémon data and some assets are loaded from external services.
- API availability and response time depend on PokéAPI.
- Battle predictions are simplified estimates rather than full game simulations.
- Competitive build recommendations are generated heuristically.
- Pokémon names, artwork, characters, and related trademarks belong to their respective owners.
- This is a personal/educational project and is not affiliated with or endorsed by Nintendo, Game Freak, The Pokémon Company, or PokéAPI.

---

## 🔮 Possible Future Improvements

- Advanced battle simulation
- Move search and filtering
- More detailed competitive builds
- Nature and EV/IV calculator
- Team import/export
- Pokémon matchup matrix
- Additional localization
- Offline caching / PWA support
- Shareable team links
- Improved accessibility and keyboard navigation

---

## 🙌 Acknowledgements

- [PokéAPI](https://pokeapi.co/) for providing the Pokémon API.
- [Font Awesome](https://fontawesome.com/) for interface icons.

---

<div align="center">

### Gotta catch 'em all! ⚡

Made for learning, experimenting, and building better web experiences.

</div>
