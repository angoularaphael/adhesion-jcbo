# Paiements marketplace — prix admin & répartition 80 / 20

## Prix des cours (admin)

1. Connectez-vous en **admin** → **Cours** (`/dashboard/cours`).
2. Créez ou **Modifiez** un cours.
3. Renseignez le champ **Prix marketplace (€)** avant de passer le statut à **Publié**.
4. Seuls les cours **Publiés** avec un prix **> 0** apparaissent dans la marketplace adhérent (`/adherent/marketplace`).

Le montant saisi est celui facturé à l’adhérent (Stripe en EUR, NotchPay converti en XAF au taux ~655 FCFA/€).

---

## Quel est le « compte principal » ?

**Oui** : le compte principal est celui qui a **créé** le compte Stripe (ou NotchPay) et qui possède les clés dans `.env` :

| Variable | Compte |
|----------|--------|
| `STRIPE_SECRET_KEY` / `PUBLIC_STRIPE_KEY` | **Principal** — votre compte JCBO (plateforme) |
| `STRIPE_CONNECTED_ACCOUNT_ID` | **Secondaire** — le partenaire invité via Stripe Connect |
| `NOTCHPAY_PUBLIC_KEY` | **Principal** — marchand JCBO |
| `NOTCHPAY_CONNECTED_ACCOUNT_ID` | **Secondaire** — sous-compte Sync du partenaire |

C’est ce compte principal qui reçoit les **80 %** (`application_fee`). Le compte connecté reçoit les **20 %** par transfert automatique au moment du paiement ; chaque compte a ensuite **son propre calendrier de virement** vers sa banque.

---

## Répartition des fonds

| Compte | Part | Rôle |
|--------|------|------|
| **Principal** (JCBO — plateforme) | **80 %** | Compte Stripe / NotchPay qui héberge l’application |
| **Secondaire** (connecté) | **20 %** | Partenaire, formateur ou entité affiliée |

La logique est centralisée dans `src/lib/payment-split.ts` et utilisée par :

- `src/pages/api/stripe/checkout.ts`
- `src/pages/api/notchpay/checkout.ts`

---

## Stripe Connect (carte bancaire, EUR)

### Prérequis

- Compte Stripe **plateforme** (compte principal JCBO).
- Un compte **Connect** « Express » ou « Standard » pour le partenaire (compte secondaire).

### Étapes

1. **Dashboard Stripe** → [Connect](https://dashboard.stripe.com/connect/accounts/overview) → **Créer un compte connecté**.
2. Compléter l’onboarding du partenaire (identité, IBAN, etc.) jusqu’au statut **Charges enabled**.
3. Copier l’ID du compte connecté : `acct_xxxxxxxx`.
4. Dans les variables d’environnement du projet :

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECTED_ACCOUNT_ID=acct_xxxxxxxx
```

5. **Webhook** : endpoint `POST /api/stripe/webhook` — événement `checkout.session.completed` (déjà géré dans le code).

### Fonctionnement technique

Lors du checkout marketplace, si `STRIPE_CONNECTED_ACCOUNT_ID` est défini :

```text
Paiement total (ex. 100 €)
├── application_fee_amount → 80 € (compte principal / plateforme)
└── transfer_data.destination → 20 € (compte connecté secondaire)
```

Paramètres Stripe Checkout (`payment_intent_data`) :

- `application_fee_amount` = 80 % du total (en centimes).
- `transfer_data.destination` = ID du compte connecté ; Stripe transfère automatiquement le **reste** (20 %).

### Test

- Mode test : clés `sk_test_...` + compte connecté test `acct_...`.
- Carte test : `4242 4242 4242 4242`.
- Vérifier dans Stripe → **Paiements** → détail : frais plateforme + transfert vers le compte connecté.

### Virements bancaires chaque vendredi

Les **80 %** arrivent d’abord sur le **solde Stripe du compte principal** (pas directement sur le compte bancaire). Le passage en banque = **virement (payout)** Stripe, réglé séparément du code de l’application.

#### Compte principal JCBO (80 %)

1. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com) avec le compte qui possède `STRIPE_SECRET_KEY` (celui qui a créé Connect).
2. **Paramètres** (engrenage) → **Virements** (ou *Payouts* / *Comptes bancaires et planification*).
3. Planification : **Hebdomadaire** (*Weekly*).
4. Jour : **Vendredi** (*Friday*).
5. Enregistrer.

Les fonds encaissés du lundi au dimanche (selon le fuseau du compte) sont regroupés et virés le **vendredi suivant** (délai bancaire possible : 1–3 jours ouvrés).

> En mode **test**, les virements ne partent pas vers une vraie banque ; vérifiez seulement le solde dans **Transactions → Solde**.

#### Compte connecté secondaire (20 %)

Le partenaire gère en général **son** calendrier depuis son espace Express, ou vous le fixez pour lui :

1. Dashboard → [Connect → Comptes](https://dashboard.stripe.com/connect/accounts/overview) → ouvrir le compte `acct_...`.
2. Onglet **Virements** / **Payouts** → **Hebdomadaire**, jour **Vendredi**.

Ou via l’API (une fois, avec la clé plateforme) :

```bash
curl https://api.stripe.com/v1/accounts/acct_XXXXXXXX \
  -u "sk_live_...:" \
  -d "settings[payouts][schedule][interval]=weekly" \
  -d "settings[payouts][schedule][weekly_anchor]=friday"
```

(Remplacez `acct_XXXXXXXX` par `STRIPE_CONNECTED_ACCOUNT_ID`.)

---

## NotchPay Sync (Mobile Money Afrique, XAF)

Alternative pour l’Afrique centrale / Mobile Money (Orange Money, MTN, etc.) via [NotchPay](https://notchpay.co).

### Prérequis

- Compte NotchPay **principal** (JCBO).
- Activation **NotchPay Sync** (split / sous-comptes) pour le partenaire.
- ID du compte connecté secondaire fourni par NotchPay.

### Étapes

1. Créer le compte marchand principal sur [NotchPay](https://notchpay.co).
2. Demander l’activation **Sync** et créer / lier le **compte secondaire** du partenaire.
3. Récupérer les clés API (tableau de bord → API).
4. Variables d’environnement :

```env
NOTCHPAY_PUBLIC_KEY=pk_...
NOTCHPAY_SECRET_KEY=sk_...          # si requis pour webhooks / vérification
NOTCHPAY_CONNECTED_ACCOUNT_ID=...   # identifiant du compte Sync secondaire
```

5. **Callback succès** : `/paiement/succes?provider=notchpay` (déjà configuré).
6. Configurer le **webhook** NotchPay vers `POST /api/notchpay/webhook` si disponible sur votre offre.

### Fonctionnement technique

Pour un panier converti en XAF (`montant_eur × 655`, minimum 100 XAF) :

```text
Montant total XAF
├── application_fee → 80 % (compte principal)
└── destination.amount → 20 % (compte connecté)
```

Corps API (voir `src/lib/notchpay.ts`) :

- `application_fee` : part plateforme (80 %).
- `destination.account` + `destination.amount` : part secondaire (20 %).

### Test

- Utiliser les clés **sandbox** NotchPay si proposées.
- Passer une commande depuis la marketplace → choix Mobile Money.
- Vérifier le statut sur le dashboard NotchPay et l’inscription automatique aux cours après succès.

### Virements chaque vendredi (NotchPay)

Sur le **compte principal** NotchPay (celui de `NOTCHPAY_PUBLIC_KEY`) :

1. Tableau de bord NotchPay → **Retraits** / **Payouts** (libellé selon la version).
2. Choisir une fréquence **hebdomadaire** et le jour **vendredi**, si l’option est disponible.
3. Sinon, contacter le support NotchPay pour activer un **retrait automatique hebdomadaire le vendredi** sur le compte marchand principal et, si besoin, sur le compte Sync secondaire.

NotchPay ne permet pas toujours le même réglage fin que Stripe ; la confirmation du jour exact se fait dans leur interface ou par ticket support.

---

## Variables d’environnement — récapitulatif

```env
# Stripe (Europe / carte)
STRIPE_SECRET_KEY=
PUBLIC_STRIPE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECTED_ACCOUNT_ID=acct_...

# NotchPay (Afrique / Mobile Money)
NOTCHPAY_PUBLIC_KEY=
NOTCHPAY_SECRET_KEY=
NOTCHPAY_CONNECTED_ACCOUNT_ID=

# URL publique (callbacks)
PUBLIC_ADHESION_URL=https://votre-domaine.fr
```

Sans `STRIPE_CONNECTED_ACCOUNT_ID` ou `NOTCHPAY_CONNECTED_ACCOUNT_ID`, le paiement est encaissé **intégralement** sur le compte principal (pas de split automatique).

---

# Guide complet : compte JCBO + compte partenaire (Stripe & NotchPay)

Objectif : split **80 % JCBO** / **20 % partenaire** à chaque vente, puis **virement bancaire (ou Mobile Money) chaque vendredi** des **deux côtés**.

| Étape | JCBO (principal) | Partenaire (secondaire) |
|-------|------------------|-------------------------|
| Stripe | Compte qui a créé Stripe + `STRIPE_SECRET_KEY` | Compte Connect `acct_...` |
| NotchPay | Marchand + `NOTCHPAY_PUBLIC_KEY` | Sous-compte Sync |
| Part reçue | 80 % | 20 % |
| Virement banque | Vendredi (à configurer) | Vendredi (à configurer) |

---

## A. Stripe — Compte principal JCBO (80 %)

### A1. Créer / vérifier le compte plateforme

1. Créer ou ouvrir le compte sur [stripe.com](https://dashboard.stripe.com/register) (email JCBO).
2. **Activer le compte** : identité, entreprise, IBAN français (ou pays du compte).
3. Attendre le statut **Paiements activés** dans le tableau de bord.

### A2. Activer Stripe Connect

1. Dashboard → **Connect** → **Commencer** / **Get started**.
2. Choisir le modèle **Plateforme ou marketplace**.
3. Type de comptes connectés recommandé :
   - **Express** : onboarding simple pour le partenaire, vous gardez le contrôle (adapté à JCBO).
   - **Standard** : le partenaire a un dashboard Stripe complet (plus autonome).
4. Renseigner l’URL du site : `PUBLIC_ADHESION_URL` (ex. `https://adhesion.jcbo-conseil.fr`).
5. Valider les conditions Connect.

### A3. Clés API & webhook (application)

1. **Développeurs** → **Clés API** :
   - Copier **Clé secrète** → `STRIPE_SECRET_KEY` (ex. `sk_live_...`).
   - Copier **Clé publiable** → `PUBLIC_STRIPE_KEY` (ex. `pk_live_...`).
2. **Développeurs** → **Webhooks** → **Ajouter un endpoint** :
   - URL : `https://VOTRE-DOMAINE/api/stripe/webhook`
   - Événements : `checkout.session.completed` (minimum).
   - Copier le **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
3. Mettre à jour le fichier `.env` sur le serveur (Vercel / hébergement).

### A4. Virements JCBO chaque vendredi (80 %)

1. Dashboard (compte JCBO, pas Connect) → **Paramètres** ⚙️.
2. **Comptes bancaires et planification des virements** (ou **Virements** / *Payouts*).
3. Ajouter / vérifier le **compte bancaire** (IBAN).
4. **Planification des virements** :
   - Fréquence : **Hebdomadaire** (*Weekly*).
   - Jour : **Vendredi** (*Friday*).
5. **Enregistrer**.

> Les 80 % (`application_fee`) s’accumulent sur le **solde Stripe JCBO** après chaque paiement ; le virement vers la banque part le **vendredi** selon ce calendrier (+ délai bancaire éventuel).

---

## B. Stripe — Compte partenaire Connect (20 %)

### B1. Créer le compte connecté

**Option 1 — Dashboard (simple)**

1. Dashboard JCBO → **Connect** → **Comptes** → **Créer un compte**.
2. Type : **Express** (recommandé) ou **Standard**.
3. Saisir l’**e-mail du partenaire** (il recevra le lien d’onboarding).
4. Créer le compte → noter l’ID **`acct_xxxxxxxx`** → `STRIPE_CONNECTED_ACCOUNT_ID` dans `.env`.

**Option 2 — Lien d’onboarding (le partenaire s’inscrit lui-même)**

1. Connect → **Comptes** → **Créer un compte** → Express.
2. **Copier le lien d’onboarding** et l’envoyer au partenaire (e-mail, WhatsApp).
3. Le partenaire ouvre le lien et complète les étapes (voir B2).

### B2. Onboarding partenaire (à faire par le partenaire)

Le partenaire doit terminer **toutes** ces étapes :

1. Ouvrir le **lien d’onboarding Stripe** envoyé par JCBO.
2. **Identité** : nom, date de naissance, adresse, pièce d’identité (photo).
3. **Activité** : type d’activité, site ou description (« Formations JCBO »).
4. **Compte bancaire** : IBAN ou RIB pour recevoir les virements (20 %).
5. **Conditions** : accepter les conditions Stripe Connect.
6. Valider jusqu’à l’écran **Terminé** / **Compte activé**.

**Côté JCBO — vérifier le statut**

1. Connect → **Comptes** → cliquer sur le compte partenaire.
2. Vérifier :
   - **Paiements** : Activés (*Charges enabled*).
   - **Virements** : Activés (*Payouts enabled*).
3. Si un point est « En attente », le partenaire doit compléter les infos manquantes.

### B3. Brancher le partenaire dans l’application

Dans `.env` (production) :

```env
STRIPE_CONNECTED_ACCOUNT_ID=acct_xxxxxxxx
```

Redéployer l’application. Sans cette variable, les 100 % restent sur JCBO.

### B4. Virements partenaire chaque vendredi (20 %)

Les 20 % sont **transférés automatiquement** sur le solde Stripe du compte connecté à chaque vente. Le partenaire doit configurer **ses** virements vers sa banque :

**Méthode 1 — Le partenaire (Express Dashboard)**

1. Le partenaire ouvre le lien **Connexion Express** (Stripe envoie un lien « Se connecter au tableau de bord » depuis Connect → Compte → **Actions**).
2. Section **Soldes** / **Virements** (*Payouts*).
3. Choisir **Hebdomadaire**, jour **Vendredi**.
4. Enregistrer.

**Méthode 2 — JCBO configure pour le partenaire (API)**

Depuis une machine sécurisée (ne pas committer la clé) :

```bash
curl https://api.stripe.com/v1/accounts/acct_PARTENAIRE \
  -u "VOTRE_STRIPE_SECRET_KEY:" \
  -d "settings[payouts][schedule][interval]=weekly" \
  -d "settings[payouts][schedule][weekly_anchor]=friday"
```

Remplacer `acct_PARTENAIRE` par `STRIPE_CONNECTED_ACCOUNT_ID`.

**Méthode 3 — Dashboard JCBO**

1. Connect → **Comptes** → compte partenaire → **Virements**.
2. Si l’interface le permet : **Hebdomadaire** + **Vendredi** (selon type Express/Standard).

### B5. Test Stripe (avant production)

1. Activer le **mode test** (interrupteur en haut du dashboard).
2. Clés test dans `.env` local : `sk_test_...`, `pk_test_...`.
3. Créer un compte connecté **test** → `acct_test_...`.
4. Marketplace → paiement carte test `4242 4242 4242 4242`.
5. Vérifier : paiement OK, **80 %** sur solde plateforme test, **20 %** sur solde connecté test.

---

## C. NotchPay — Compte principal JCBO (80 %)

> NotchPay **Sync** (marketplace / split) doit être **activé par l’équipe NotchPay** avant de créer des sous-comptes partenaires.

### C1. Créer le compte marchand JCBO

1. Inscription : [business.notchpay.co/register](https://business.notchpay.co/register).
2. Compléter le profil entreprise JCBO (nom, pays, secteur).
3. **Vérification KYC** : documents entreprise + pièce d’identité du représentant.
4. Attendre la validation du compte (**compte actif**).

### C2. Activer NotchPay Sync

1. Contacter NotchPay : [notchpay.co](https://notchpay.co) → **Contact sales** / support.
2. Demander explicitement :
   - Activation **Sync** (marketplace) ;
   - Split **80 % plateforme / 20 % compte connecté** ;
   - Comptes **Standard** ou **Express** pour les partenaires (selon votre besoin).
3. Une fois activé, accès aux menus **Sync** / **Comptes connectés** dans le dashboard.

### C3. Clés API & webhooks (application)

1. Dashboard NotchPay → **Développeurs** / **API** :
   - **Clé publique** → `NOTCHPAY_PUBLIC_KEY`
   - **Clé secrète** (si fournie) → `NOTCHPAY_SECRET_KEY`
2. **Webhook** (si disponible) :
   - URL : `https://VOTRE-DOMAINE/api/notchpay/webhook`
   - Événements paiement réussi / complété.
3. `.env` :

```env
NOTCHPAY_PUBLIC_KEY=...
NOTCHPAY_SECRET_KEY=...
PUBLIC_ADHESION_URL=https://VOTRE-DOMAINE
```

### C4. Virements JCBO chaque vendredi (80 % — NotchPay)

1. Dashboard NotchPay (compte **JCBO**, pas le partenaire).
2. Menu **Retraits** / **Payouts** / **Transferts**.
3. Ajouter le **compte bancaire** ou **Mobile Money** de réception JCBO.
4. Activer les retraits **automatiques** :
   - Fréquence : **Hebdomadaire**
   - Jour : **Vendredi**
5. Si l’option n’existe pas dans l’interface : écrire au support NotchPay :

   > « Merci d’activer les retraits automatiques **chaque vendredi** sur notre compte marchand principal (référence / e-mail du compte). »

---

## D. NotchPay — Compte partenaire Sync (20 %)

### D1. Créer le compte connecté partenaire

**Via dashboard NotchPay Sync** (après activation Sync) :

1. JCBO connecté au dashboard principal → **Sync** → **Comptes** / **Connected accounts**.
2. **Créer un compte** → saisir e-mail et nom du partenaire.
3. Noter l’**identifiant du compte** (fourni par NotchPay) → `NOTCHPAY_CONNECTED_ACCOUNT_ID` dans `.env`.

**Via API** (selon [documentation Sync](https://developer.notchpay.co/sync)) :

1. Créer le compte connecté avec la clé plateforme.
2. Générer un **lien d’onboarding** :

```http
POST https://api.notchpay.co/accounts/{accountId}/onboarding
Authorization: NOTCHPAY_PUBLIC_KEY (ou clé secrète selon doc)
Content-Type: application/json

{
  "callback": "https://VOTRE-DOMAINE/dashboard/cours"
}
```

3. Envoyer l’`onboardingUrl` au partenaire.

### D2. Onboarding partenaire NotchPay (à faire par le partenaire)

1. Ouvrir le **lien d’onboarding** NotchPay.
2. Créer ou lier un compte NotchPay (si nouveau marchand).
3. **KYC** : identité + documents.
4. **Coordonnées de versement** :
   - Compte bancaire **ou**
   - **Mobile Money** (Orange Money, MTN, etc. selon pays).
5. Valider jusqu’au statut **Compte vérifié / Actif**.

**Côté JCBO — vérifier**

1. Sync → liste des comptes → statut **Actif** / **Vérifié**.
2. Copier l’ID définitif dans `NOTCHPAY_CONNECTED_ACCOUNT_ID`.
3. Redéployer l’application.

### D3. Brancher le partenaire dans l’application

```env
NOTCHPAY_CONNECTED_ACCOUNT_ID=id_compte_partenaire
```

Le checkout (`/api/notchpay/checkout`) enverra alors :

- `application_fee` = 80 % du montant XAF → JCBO ;
- `destination` = 20 % → compte partenaire.

### D4. Virements partenaire chaque vendredi (20 % — NotchPay)

Le partenaire a **son propre dashboard** NotchPay (compte Standard) :

1. Le partenaire se connecte sur [business.notchpay.co](https://business.notchpay.co) avec l’e-mail utilisé à l’onboarding.
2. **Retraits** / **Payouts** :
   - Compte de réception (banque ou Mobile Money) ;
   - Planification : **Hebdomadaire**, jour **Vendredi**.
3. Si le partenaire est en compte **Express** (géré par la plateforme) :
   - JCBO demande au support NotchPay le **même calendrier vendredi** pour ce sous-compte ;
   - ou JCBO configure dans **Sync → Compte partenaire → Planification des transferts**.

Message type pour le support (partenaire) :

> « Merci d’activer les retraits automatiques **chaque vendredi** pour le compte Sync partenaire [ID ou e-mail], en parallèle de notre compte principal. »

### D5. Test NotchPay

1. Environnement **sandbox / test** si NotchPay le fournit.
2. Cours publié avec **prix > 0**.
3. Marketplace adhérent → paiement **Mobile Money**.
4. Vérifier dans les deux dashboards : répartition 80 / 20 et inscription au cours après succès.

---

## E. Checklist finale (les deux côtés, vendredi des deux côtés)

### Stripe

| # | Action | JCBO | Partenaire |
|---|--------|------|------------|
| 1 | Compte créé et vérifié | ✅ Dashboard Stripe JCBO | ✅ Onboarding Connect terminé |
| 2 | Connect activé + compte `acct_...` | ✅ | ✅ `Charges` + `Payouts` activés |
| 3 | Variables `.env` | `STRIPE_SECRET_KEY`, `WEBHOOK`, `PUBLIC_STRIPE_KEY` | `STRIPE_CONNECTED_ACCOUNT_ID` |
| 4 | Virements **vendredi** | Paramètres → Virements → Hebdo → Vendredi | Express dashboard ou API `weekly_anchor=friday` |
| 5 | Test paiement marketplace | Solde +80 % plateforme | Solde +20 % connecté |

### NotchPay

| # | Action | JCBO | Partenaire |
|---|--------|------|------------|
| 1 | Compte marchand actif | ✅ business.notchpay.co | ✅ Onboarding Sync terminé |
| 2 | Sync activé par NotchPay | ✅ Contact sales fait | ✅ Compte connecté créé |
| 3 | Variables `.env` | `NOTCHPAY_PUBLIC_KEY`, `SECRET` | `NOTCHPAY_CONNECTED_ACCOUNT_ID` |
| 4 | Virements **vendredi** | Retraits auto hebdo vendredi (ou ticket support) | Dashboard partenaire ou ticket support Sync |
| 5 | Test Mobile Money | 80 % sur compte JCBO | 20 % sur compte partenaire |

### Application JCBO

| # | Action |
|---|--------|
| 1 | Chaque cours **Publié** a un **prix marketplace (€)** > 0 |
| 2 | `PUBLIC_ADHESION_URL` correct en production |
| 3 | Webhooks Stripe + NotchPay pointent vers le domaine de production |
| 4 | Redéploiement après toute modification du `.env` |

---

## F. Rappels importants

1. **Compte principal** = celui qui a créé Stripe / NotchPay et détient les clés API dans `.env` (JCBO, 80 %).
2. **Compte partenaire** = Connect Stripe `acct_...` ou sous-compte NotchPay Sync (20 %).
3. Le **split 80/20** est automatique à chaque vente (code déjà en place) ; le **virement vendredi** se règle **séparément** chez Stripe et NotchPay pour **chaque** compte.
4. Le partenaire doit **terminer l’onboarding** ; sans cela, les virements vers sa banque restent bloqués même si les 20 % sont bien crédités sur son solde NotchPay / Stripe.
5. Fuseau horaire : Stripe utilise le fuseau du compte (souvent **Europe/Paris**) pour déterminer la semaine de payout ; en cas de doute, vérifier dans **Paramètres → Compte**.

### Liens utiles

- Stripe Connect comptes : https://dashboard.stripe.com/connect/accounts/overview  
- Stripe virements (JCBO) : https://dashboard.stripe.com/settings/payouts  
- NotchPay Sync (doc) : https://developer.notchpay.co/sync  
- NotchPay gestion comptes : https://developer.notchpay.co/sync/account-management  
