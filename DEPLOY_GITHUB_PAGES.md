# Deploy — GitHub Pages

## URL final

https://henrico-design-amaral.github.io/personalops/

## Passo a passo

### 1. Inicializar Git (se necessário)

```bash
git init
git add .
git commit -m "feat: add PersonalOps static v1"
```

### 2. Criar repositório no GitHub e fazer push

Se o repositório ainda não existe:

```bash
gh repo create personalops --public --source . --remote origin --push
```

Se o repositório já existe:

```bash
git remote add origin https://github.com/henrico-design-amaral/personalops.git
git push -u origin main
```

### 3. Ativar GitHub Pages

**Via GitHub CLI:**
```bash
gh api repos/henrico-design-amaral/personalops/pages \
  --method POST \
  --field source[branch]=main \
  --field source[path]=/
```

**Se o comando acima falhar, fazer manualmente:**

1. Acessar: https://github.com/henrico-design-amaral/personalops/settings/pages
2. Em "Build and deployment" > "Source", selecionar **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Clicar em **Save**

A URL estará disponível em alguns minutos em:
https://henrico-design-amaral.github.io/personalops/

## Arquivos obrigatórios para GitHub Pages

- `.nojekyll` — presente (evita processamento Jekyll)
- `index.html` — presente na raiz
- `manifest.webmanifest` — presente
- `service-worker.js` — presente
