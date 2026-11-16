# Guide d'utilisation & Ajout de vos Assets — Portfolio de John-Mary AYIVI

Ce dossier contient votre portfolio complet (HTML5 / CSS3 / JavaScript natif), déjà fonctionnel avec des **jumeaux numériques interactifs** et un **générateur de CV A4 imprimable en PDF**.

---

## 1. Tester le site localement

Pour que le chargement automatique de vos futurs modèles `.glb` et de vos exports Web Godot fonctionne sans restriction navigateur (`file://`), lancez simplement un petit serveur local depuis ce dossier :

```bash
cd /home/john/portfolio
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

---

## 2. Ajouter vos modèles 3D Blender (`.glb`)

Dans Blender : **Fichier → Exporter → glTF 2.0 (`.glb/.gltf`)** (format `glTF Binary (.glb)`).
Déposez vos fichiers dans `assets/models/` avec exactement ces noms :

- `assets/models/bougie.glb` → La Dernière Bougie & animations
- `assets/models/personnage-cartoon.glb` → Personnage Cartoon
- `assets/models/pokeball.glb` → Collection de Pokéballs

> **Astuce immédiate :** Sur chaque carte du **3D Asset Lab**, le bouton **`+.glb`** vous permet déjà de charger un fichier `.glb` depuis votre disque en 1 clic pour tester son rendu !
> *(Note : `<model-viewer>` nécessite une connexion Internet pour charger son script Google CDN ; hors ligne, le moteur 3D wireframe/ombré intégré prend automatiquement le relais.)*

---

## 3. Intégrer votre Snake (Export Web HTML5 depuis Godot)

1. Dans Godot : **Projet → Exporter → Ajouter → Web (HTML5)**.
2. Exportez le projet dans le dossier :
   `/home/john/portfolio/games/snake/`
3. Nommez le fichier HTML principal **`index.html`** (`games/snake/index.html`).
4. Sur la carte **Snake Revisité** du portfolio, cliquez sur **`Basculer vers Export Godot (games/snake/)`** : votre jeu Godot se chargera automatiquement à la place du mini-Snake de secours.

---

## 4. Ajouter des captures du Runner ou médias (`assets/media/`)

Déposez vos captures d'écran ou courtes vidéos du Runner ou de *La Dernière Bougie* dans `assets/media/` (par exemple `runner-preview.png`, `bougie-gameplay.mp4`).

---

## 5. Exporter votre nouveau CV en PDF

1. Cliquez sur **`CV / PDF`** dans la barre de navigation (ou appuyez sur `Ctrl + K` → *Ouvrir mon CV A4*).
2. Cliquez sur **`Imprimer / Enregistrer en PDF`**.
3. Dans la fenêtre d'impression du navigateur, sélectionnez **Destination : Enregistrer au format PDF** (format **A4**, marges par défaut).

---

## 6. Mettre en ligne gratuitement (GitHub Pages)

1. Créez un dépôt sur votre compte `https://github.com/shinkiflinn-ops` (par exemple `portfolio` ou `shinkiflinn-ops.github.io`).
2. Envoyez le contenu de `/home/john/portfolio` sur ce dépôt (`git init`, `git add .`, `git commit`, `git push`).
3. Dans **Settings → Pages** du dépôt GitHub, sélectionnez la branche `main` et le dossier `/ (root)` puis enregistrez.
4. Votre portfolio sera accessible en ligne en quelques instants !
