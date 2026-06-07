# E-mails OVH, Gmail et Stripe Connect (80 % / 20 %)

## Rôles des 3 adresses @jcbo-conseil.com

| Adresse | Rôle | Utilisation dans le code |
|---------|------|--------------------------|
| **no-reply@jcbo-conseil.com** | Envoi automatique uniquement | `SMTP_USER` + `FROM_EMAIL` |
| **contact@jcbo-conseil.com** | Support clients + alertes admin | `CONTACT_EMAIL`, `NOTIFY_EMAIL`, `REPLY_TO_EMAIL` |
| **jcboyang@jcbo-conseil.com** | Boîte personnelle Jean-Christophe | **Aucun envoi auto** — lecture Gmail uniquement |

Les e-mails automatiques (identifiants adhérents, nouvelles actualités/cours/ressources, confirmations…) partent de **no-reply** avec `Reply-To: contact@jcbo-conseil.com`.

Les alertes admin (paiements, diagnostics…) vont vers **contact@** via `NOTIFY_EMAIL`, pas vers jcboyang@.

---

## Variables Vercel (adhesion-jcbo + jcbo-vitrine)

À configurer dans **Vercel → Settings → Environment Variables** (ne jamais commiter le mot de passe) :

```env
SMTP_HOST=pro2.mail.ovh.net
SMTP_PORT=587
SMTP_USER=no-reply@jcbo-conseil.com
SMTP_PASS=<mot_de_passe_ovh>
FROM_EMAIL=JCBO Conseil <no-reply@jcbo-conseil.com>
REPLY_TO_EMAIL=contact@jcbo-conseil.com
CONTACT_EMAIL=contact@jcbo-conseil.com
NOTIFY_EMAIL=contact@jcbo-conseil.com
ADMIN_EMAIL=angoularaphael05@gmail.com
```

`ADMIN_EMAIL` reste l’e-mail de **connexion super admin** (inchangé).

---

## Configurer les 3 adresses dans Gmail

Gmail ne crée pas les boîtes OVH : il **consulte** vos adresses OVH via IMAP.

### Étape 1 — Ajouter chaque compte dans Gmail

Pour **contact@**, **jcboyang@** et éventuellement **no-reply@** (lecture seule des bounces) :

1. Ouvrez [Gmail](https://mail.google.com) avec votre compte Google habituel.
2. Cliquez l’**engrenage** → **Voir tous les paramètres** → onglet **Comptes et importation**.
3. Section **Consulter les e-mails d'autres comptes** → **Ajouter un compte de messagerie**.
4. Saisissez l’adresse (ex. `contact@jcbo-conseil.com`).
5. Cochez **Importer les e-mails** (recommandé).
6. Serveur entrant OVH :
   - **IMAP** : `pro2.mail.ovh.net` (vérifiez le numéro dans l'espace client OVH → Email Pro)
   - Port **993** — SSL/TLS
   - Identifiant : l’adresse complète
   - Mot de passe : celui de la boîte OVH
7. Serveur sortant (si Gmail demande d’envoyer via OVH) :
   - **SMTP** : `pro2.mail.ovh.net`
   - Port **587** — STARTTLS
   - Identifiant : la même adresse
8. Répétez pour `jcboyang@jcbo-conseil.com`.

### Étape 2 — Envoyer « en tant que » no-reply (optionnel)

Si vous voulez répondre manuellement depuis Gmail avec la bonne identité :

1. **Comptes et importation** → **Ajouter une autre adresse e-mail** (section Envoyer).
2. Adresse : `no-reply@jcbo-conseil.com`
3. SMTP OVH : `pro2.mail.ovh.net:587`, identifiant = no-reply@, mot de passe OVH.

> L’application JCBO envoie déjà via SMTP OVH (`no-reply@`) : cette étape n’est utile que pour des envois manuels depuis Gmail.

### Étape 3 — Filtrer la boîte jcboyang@

Pour que Jean-Christophe ne reçoive pas les alertes système sur sa boîte perso :

- Les envois automatiques ne ciblent **jamais** jcboyang@ (config `NOTIFY_EMAIL=contact@`).
- Si des messages arrivent encore sur jcboyang@, créez un filtre Gmail : expéditeur contient `no-reply@jcbo-conseil.com` → libellé « Automatique » ou transfert vers contact@.

---

## Délivrabilité — SPF et DKIM (si Gmail ne reçoit rien)

L’API peut répondre **succès** (SMTP OVH accepte l’envoi) alors que Gmail **filtre** le message (spams / Promotions / rejet silencieux). Cause fréquente : le **SPF** du domaine n’autorise pas les serveurs OVH Email Pro.

### 1. Corriger le SPF (zone DNS OVH)

1. Espace client OVH → **Noms de domaine** → `jcbo-conseil.com` → **Zone DNS**.
2. Modifiez l’enregistrement **TXT** existant qui commence par `v=spf1` (un seul SPF par domaine).
3. Ajoutez **`include:mx.ovh.com`** sans supprimer le reste.

Exemple (à adapter à votre enregistrement actuel) :

```
v=spf1 ip4:109.234.166.107 +a +mx include:spf.jabatus.fr include:mx.ovh.com ~all
```

4. Attendez 15 min à 24 h (propagation DNS).

### 2. Activer DKIM (Email Pro OVH)

1. OVH → **E-mail Pro** → domaine `jcbo-conseil.com` → **DKIM**.
2. Activez la signature DKIM et validez l’enregistrement DNS proposé par OVH.

### 3. Vérifier

- [mail-tester.com](https://www.mail-tester.com) : envoyez un test depuis l’admin ou l’API, visez une note ≥ 8/10.
- Consultez **contact@jcbo-conseil.com** : chaque téléchargement vitrine envoie une **copie cachée (BCC)** à `NOTIFY_EMAIL` pour confirmer l’envoi côté serveur.
- Dashboard admin → **Ressources** → tableau des téléchargements (e-mail + date enregistrés même si le client ne reçoit pas).

### 4. Outlook reçoit, Gmail non → DKIM OVH manquant

Si **Outlook** reçoit les e-mails mais **Gmail** non, l’envoi SMTP fonctionne. Gmail est plus strict sur l’**authentification DKIM**.

Le DKIM `default._domainkey` dans o2switch sert à la **messagerie o2switch**, pas à **OVH Email Pro** (`no-reply@`). Il faut ajouter les CNAME DKIM fournis par OVH :

1. Espace client **OVH** → **E-mail Pro** → domaine `jcbo-conseil.com` → onglet **DKIM**.
2. OVH affiche 1 ou 2 enregistrements **CNAME** (ex. `ovhemp123456-selector1._domainkey`).
3. Dans **o2switch** → Éditeur de zone DNS → **Ajouter un enregistrement** → type **CNAME** pour chaque sélecteur :
   - **Nom** : `ovhemp123456-selector1._domainkey` (sans le domaine, o2switch l’ajoute)
   - **Cible** : la valeur OVH (ex. `ovhemp123456-selector1._domainkey.1500.ab.dkim.mail.ovh.net.`)
4. Retour OVH → **Activer** / valider DKIM (statut vert).
5. Attendre 1 à 24 h, puis retester Gmail.

**Côté Gmail (en attendant)** : chercher dans **Spam**, **Promotions**, **Tous les messages** ; marquer « Pas un spam » sur un e-mail de `no-reply@jcbo-conseil.com` pour améliorer la réputation.

---

## Stripe Connect — 80 % Jean-Christophe / 20 % développeur

### Qui reçoit quoi dans le code

| Compte Stripe | Variable | Part |
|---------------|----------|------|
| **Principal** (propriétaire des clés API) | `STRIPE_SECRET_KEY` | **80 %** |
| **Connecté** (invité Connect) | `STRIPE_CONNECTED_ACCOUNT_ID` | **20 %** |

Pour que **Jean-Christophe (jcboyang@)** reçoive **80 %** :

1. Le compte Stripe **principal** doit être celui de Jean-Christophe (ou de JCBO Conseil à son nom).
2. Les clés `STRIPE_SECRET_KEY` / `PUBLIC_STRIPE_KEY` dans Vercel sont celles de **ce** compte.
3. Vous (développeur) créez un compte **Stripe Connect** invité ; son ID `acct_...` va dans `STRIPE_CONNECTED_ACCOUNT_ID` → vous recevez **20 %** automatiquement à chaque paiement.

### Mise en place Connect

1. [Dashboard Stripe](https://dashboard.stripe.com) (compte Jean-Christophe) → **Connect** → **Créer un compte**.
2. Type **Express** ou **Standard** pour le partenaire (vous).
3. Envoyez le lien d’onboarding (identité + IBAN).
4. Une fois **Charges enabled**, copiez l’ID `acct_xxxxxxxx`.
5. Dans Vercel (adhesion-jcbo) :

```env
STRIPE_CONNECTED_ACCOUNT_ID=acct_xxxxxxxx
```

6. Webhook déjà configuré : `POST /api/stripe/webhook` — événement `checkout.session.completed`.

### Virements automatiques chaque vendredi

Stripe verse d’abord sur le **solde Stripe**, puis en banque selon le calendrier de chaque compte.

#### Compte principal (80 % — Jean-Christophe)

1. Dashboard Stripe (compte principal) → **Paramètres** → **Virements** (*Payouts*).
2. Fréquence : **Hebdomadaire** (*Weekly*).
3. Jour : **Vendredi** (*Friday*).
4. Enregistrer.

#### Compte connecté (20 % — développeur)

1. Dashboard → **Connect** → **Comptes** → ouvrir `acct_...`.
2. Onglet **Virements** → **Hebdomadaire**, jour **Vendredi**.

Ou via API (une fois, clé plateforme) :

```bash
curl https://api.stripe.com/v1/accounts/acct_VOTRE_ID \
  -u "sk_live_VOTRE_CLE:" \
  -d "settings[payouts][schedule][interval]=weekly" \
  -d "settings[payouts][schedule][weekly_anchor]=friday"
```

Les fonds encaissés sont regroupés et virés le vendredi suivant (délai bancaire 1–3 jours ouvrés).

### Test

- Mode test : `sk_test_...` + `acct_...` test.
- Carte : `4242 4242 4242 4242`.
- Vérifier dans **Paiements** → détail : frais plateforme 80 % + transfert 20 %.

---

## Sécurité

- Ne commitez **jamais** les mots de passe OVH dans Git.
- Si un mot de passe a été partagé en clair, **changez-le** dans l’espace client OVH puis mettez à jour Vercel.
- Utilisez des mots de passe **distincts** par boîte si possible.
