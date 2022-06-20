const vm = new Vue({
    el: '#app',
    data: {
        produtos: [],
        produto: false,
        carrinhoTotal: 0,
        carrinho: [],
        mensagemAlerta: 'Item adicionado',
        alertaAtivo: false,
        carrinhoAtivo: false
    },
    filters: {
        formatterForPrice(value) {
            return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        }
    },
    computed: {
        precoTotalCarrinho() {
            let total = 0;
            if (this.carrinho.length > 0) {
                this.carrinho.forEach(({ preco }) => total += preco)
            }
            return total;
        }
    },
    watch: {
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho)
        },
        produto() {
            document.title = this.produto.nome || 'Techno';
            const hash = this.produto.id || "";
            history.pushState(null, null, `#${hash}`)
            if (this.produto) {
                this.compararStock();
            }
        }
    },
    methods: {
        async getProducts() {
            const response = await fetch("./api/produtos.json");
            const produtos = await response.json();
            this.produtos = produtos;
        },
        async getProductById(product_id) {
            const response = await fetch(`api/produtos/${product_id}/dados.json`);
            const produto = await response.json();
            this.produto = produto;
        },
        openModal(product_id) {
            this.getProductById(product_id);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        },
        closeModal({ target, currentTarget }) {
            if (target === currentTarget) return this.produto = false
        },
        clickForaCarrinho({ target, currentTarget }) {
            if (target === currentTarget) return this.carrinhoAtivo = false;
        },
        addToCart() {
            this.produto.estoque--;
            const { id, nome, preco, img } = this.produto;
            this.carrinho.push({ id, nome, preco, img })
            this.alerta(`${nome} foi adicionado ao carrinho.`)
        },
        removeItemToCart(index) {
            this.carrinho.splice(index, 1)
        },
        checkLocalStorage() {
            if (window.localStorage.carrinho) {
                this.carrinho = JSON.parse(window.localStorage.carrinho);
            }
        },
        alerta(mensagem) {
            this.mensagemAlerta = mensagem;
            this.alertaAtivo = true;

            const timerId = setTimeout(() => {
                this.alertaAtivo = false
            }, 1500);

            return () => {
                clearTimeout(timerId);
            }
        },
        router() {
            const hash = document.location.hash.replace('#', "");
            if (hash) {
                this.getProductById(hash);
            }
        },
        compararStock() {
            const items = this.carrinho.filter((item) => {
                if (item.id === this.produto.id) {
                    return true
                }
            })

            this.produto.estoque = this.produto.estoque - items.length;
        }
    },
    created() {
        this.getProducts();
        this.checkLocalStorage();
        this.router();
    }
})