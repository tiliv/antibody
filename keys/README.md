# This node's Atlas peer-signer material (public only)

This node self-hosts the **Atlas** role (it lists Tells in `_data/tells.yml` and runs the
matchmaker over its own data — see `.github/workflows/match.yml`). To **peer with another
Atlas** (`.github/workflows/register-peer.yml`), it signs its peer-registration commit with an
Atlas peer-signer key, exactly as `atlas.anecdote.channel` does. This directory holds the
**public** half; the private half lives only as the repo secret `ATLAS_SIGNER_KEY`.

`atlas.fpr` ships as a **placeholder** — the peer handshake won't verify until an operator
provisions a real signer.

## One-time operator setup

The signer *code* lives in the `atlas/` submodule. From this repo root:

```sh
ssh-keygen -t ed25519 -N '' -C atlas-peer-signer -f atlas-signer   # private + .pub
gh secret set ATLAS_SIGNER_KEY < atlas-signer                      # private -> CI secret
ssh-keygen -lf atlas-signer.pub | awk '{print $2}' > keys/atlas.fpr # publish the fingerprint
git add keys/atlas.fpr && git commit -m "atlas: publish peer signer fingerprint"
shred -u atlas-signer                                              # keep only the secret + fpr
```

(Equivalently, `atlas/bin/atlas-bootstrap` does this for the `atlas.anecdote.channel` repo
itself; run from this workspace it would target the submodule, so the manual steps above place
the material at *this* repo's root where `register-peer.yml` reads it.)

A peer Atlas pins this `atlas.fpr` value as the `signer:` of this node's entry in the peer's
`_data/atlases.yml`, and confirms it out-of-band / IRL. No GitHub App; no privileged token.
