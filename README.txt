L'application web est une application de covoiturage.

--!Préparation préalable pour lancer l'application!--
- Initialiser la base de données grâce à la commande "mongod --dbpath .\dossier"
	- La base de données doit être nommé "projetFinal"
	- Pas besoin de s'occuper des collections, elles s'initialiseront d'elles-même
- Lancer le serveur grâce à la commande "node server.js"
- Se rendre sur un navigateur
	- Se rendre à l'adresse "localhost:8080"


--!Fonctionnement de l'application web!--
- Une fois l'application web lancée, une page d'accueil s'affiche
	- Pour se connecter, cliquez sur "se connecter"
	- Pour ajouter une annonce, cliquez sur "Ajouter une annonce"
	- Pour accéder à toutes les info sur un covoiturage, cliquez sur l'un d'eux dans le tableau
		-C'est aussi la page pour s'inscire à l'un d'eux.
	- Pour revenir à la page d'accueil, cliquez sur le bouton "Annonces" en haut à gauche
	- Pour accéder à son profil, cliquez sur son nom d'utilisateur en haut à droite