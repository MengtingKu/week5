const base_url = 'https://vue3-course-api.hexschool.io/v2';
const api_path = `qwe1234`;
// aa1234@gmail.com
console.log(VeeValidate);
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidateI18n.loadLocaleFromURL('/zh_TW.json');
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true,
});

const productModal = {
    props: ['id', 'addToCart'],
    data() {
        return {
            tempProduct: {},
            bsModal: '',
            qty: 1
        }
    },
    watch: {
        id() {
            axios.get(`${base_url}/api/${api_path}/product/${this.id}`)
                .then(res => {
                    this.tempProduct = res.data.product;
                    // console.log("特定產品列表 tempProduct::", res.data.product);
                    this.bsModal.show()
                })
                .catch(err => {
                    alert(err.data.message)
                })
        }
    },
    methods: {
        hide() {
            this.bsModal.hide();
        }
    },
    template: '#userProductModal',
    mounted() {
        this.bsModal = new bootstrap.Modal(this.$refs.modal);
    },
};
const app = Vue.createApp({
    data() {
        return {
            products: [],
            productId: '',
            cart: {},
            carts: [],
            hasItem: true,
            user: {
                email: '',
                name: '',
                address: '',
                phone: '',
            }
        }
    },
    methods: {
        thousands(x) {
            let parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        },
        getProducts() {
            axios.get(`${base_url}/api/${api_path}/products/all`)
                .then(res => {
                    this.products = res.data.products;
                })
                .catch(err => {
                    console.log(err);
                })
        },
        openModal(id) {
            this.productId = id;
        },
        addToCart(product_id, qty = 1) {
            const data = {
                product_id,
                qty
            };
            axios.post(`${base_url}/api/${api_path}/cart`, { data })
                .then(res => {
                    this.$refs.productModal.hide();
                    this.getCartList()
                })
                .catch(err => {
                    console.log(err);
                });
        },
        getCartList() {
            axios.get(`${base_url}/api/${api_path}/cart`)
                .then(res => {
                    console.log('購物車列表 item::', res.data.data);
                    this.cart = res.data.data;
                    this.carts = this.cart.carts;
                    console.log(this.carts.length);
                    if (this.cart.carts.length) {
                        this.hasItem = false;
                    } else {
                        this.hasItem = true;
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        cartQty(item) {
            const data = {
                product_id: item.product_id,
                qty: item.qty
            };
            axios.put(`${base_url}/api/${api_path}/cart/${item.id}`, { data })
                .then(res => {
                    console.log('cartQty列表 item::', res.data);
                    alert(`${item.product.title}${res.data.message}`);
                    this.getCartList()
                })
                .catch(err => {
                    console.log(err);
                })
        },
        delItem(item) {
            axios.delete(`${base_url}/api/${api_path}/cart/${item.id}`)
                .then(res => {
                    alert(`${item.product.title}${res.data.message}`);
                    this.getCartList()
                })
                .catch(err => {
                    console.log(err);
                })
        },
        delAllItem() {
            // this.hasItem = true;
            axios.delete(`${base_url}/api/${api_path}/carts`)
                .then(res => {
                    // console.log(res);
                    alert(`已經把所有商品移除囉！ ʕ·͡ˑ·ཻʔ `);
                    this.getCartList()
                })
                .catch(err => {
                    console.log(err);
                    alert(err.data.message)
                })
        },
        onSubmit(value) {
            console.log(value);
            this.user = {}
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        }
    },
    components: {
        productModal,
        VForm: VeeValidate.Form,
        VField: VeeValidate.Field,
        ErrorMessage: VeeValidate.ErrorMessage,
    },
    mounted() {
        this.getProducts();
        this.getCartList()
    },
});
app.component('VForm', VeeValidate.Form);                   //form表單
app.component('VField', VeeValidate.Field);                 //input欄位
app.component('ErrorMessage', VeeValidate.ErrorMessage);    //錯誤訊息
app.mount('#app');