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

Install:

```bash
pnpm i
```

Run storybook:

```bash
pnpm dev
```

Update screenshot snapshots (requires Docker):

```bash
pnpm test:update
```
