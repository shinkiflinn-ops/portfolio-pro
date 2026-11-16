# Portfolio Pro — John-Mary AYIVI

Portfolio interactif orienté **systèmes embarqués, robotique, game dev (Godot Engine) et modélisation 3D (Blender)**, conçu avec une esthétique **Darkroom Ambre** et un basculement instantané **FR / EN** (`John-Mary AYIVI` / `John-Mary Ayivi`).

- **Site en ligne (GitHub Pages) :** https://shinkiflinn-ops.github.io/portfolio-pro/
- **Auteur :** John-Mary AYIVI — Étudiant en Licence 3 Génie Électrique et Informatique (Cotonou / Abomey-Calavi) & Président du Club Art, Design & Gaming (INSTI)

---

## Fonctionnalités principales

1. **Simulateurs électroniques & IoT (ESP32)**
   - **Robot voiture GPS & télécommande Godot** : pilotage clavier (`ZQSD` / `Flèches`), suivi de coordonnées GPS et évitement autonome par ultrasons.
   - **Maison intelligente connectée sous Blynk** : synoptique ESP32 temps réel avec capteurs (température, mouvement), servomoteur, relais, LED et afficheur LCD `16×2` simulé.
2. **Jeux Godot 4.7 Web intégrés & démos jouables**
   - **La Dernière Bougie : survival 2.5D** : export Web HTML5 complet (`games/bougie/la_dernière_bougie.html`), GDD consultable en modale et mini-jeu 2.5D de survie.
   - **Ninja Run (Runner à obstacles procéduraux)** : export Web HTML5 complet (`games/ninja run/ninja run.html`) avec difficulté indexée sur la vitesse + démo rapide.
   - **Snake revisité à bonus** : mini-jeu clavier/tactile avec bonus temporaires.
3. **Atelier 3D Blender (`.glb`)**
   - Visualiseurs `<model-viewer>` interactifs à 360° avec mode plein écran (`⛶`) pour **La Dernière Bougie** (variante joueur + bougies ennemies avec animations glTF réelles), **Phare 3D** (sous ciel étoilé) et **Collection de Pokéballs**.
4. **Fiche technique, audio & CV imprimable**
   - Fiche profil **`REF // JMA-01`**, bandeau glissable **Langages & Logiciels** (`Python`, `C++`, `C#`, `GDScript`, `Arduino IDE`, `Proteus`, `KiCad`, `PL7`, `Godot Engine`, `Unity`, `Blender`, `Visual Studio`), musique d'ambiance optionnelle (`Son : Off / On`) et **CV A4 imprimable en PDF**.

---

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/` dans un navigateur.
