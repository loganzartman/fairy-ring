# fairy-ring

make webrings!

easy, customizable, ultramodern library for making your own webring. not a webring itself.

<details>
  <summary>webring?</summary>

a webring is a collection of websites that link to each other, such that the links form a ring. A <-> B <-> C <-> A ...

each site has a "next" and a "previous" link so a user can browse through the ring.

it's an alternative method of content discovery with a long history.

</details>

<details>
  <summary>development philosophy</summary>

use bleeding-edge web tooling to deliver a simple and fun developer and user experience.

</details>

## how?

[getting started](https://fairy-ring.loga.nz/?path=/story/docs-getting-started--getting-started)

1. write a fairy-ring config file in TOML and put it on the internet
2. embed your fairy-ring using a tiny snippet:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/fairy-ring/dist/standalone.js"></script>
<fairy-ring class="my-ring" config-url="https://my-ring.example/fairy-ring.toml"></fairy-ring>
```

## development

Install [nvm](https://github.com/nvm-sh/nvm), then (in a new shell) the node version from `.nvmrc`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
nvm install
```

Install pnpm with corepack (uses the version in `package.json`'s `packageManager`):

```bash
corepack enable pnpm
```

Install dependencies:

```bash
pnpm i
```

Check changes before opening a PR (build, typecheck, lint, format):

```bash
pnpm pr-check
```

Run storybook:

```bash
pnpm dev
```

Update screenshot snapshots (requires Docker):

```bash
pnpm test:update
```
