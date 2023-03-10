const base_url = 'https://vue3-course-api.hexschool.io/v2';
const api_path = `qwe1234`;
import pagination from './pagination.js';
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidateI18n.loadLocaleFromURL('/zh_TW.json');
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true,
});
// 區域元件
const productModal = {
    props: ['id', 'addToCart', 'thousands', 'openModal'],
    data() {
        return {
            tempProduct: {},
            bsModal: '',
            qty: 1
        }
    },
    watch: {
        id() {
            if (this.id) {
                axios.get(`${base_url}/api/${api_path}/product/${this.id}`)
                    .then(res => {
                        this.tempProduct = res.data.product;
                        this.bsModal.show();
                        this.qty = 1
                    })
                    .catch(err => {
                        alert(err.data.message)
                    })
            }
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
        // 監聽 DOM ，當 modal 關閉要做的事情
        this.$refs.modal.addEventListener('hidden.bs.modal', event => {
            this.openModal('')
        })
    },
};
// 根元件
const app = Vue.createApp({
    data() {
        return {
            isLoading: true,
            products: [],
            productId: '',
            page: {},
            cart: {},
            carts: [],
            hasItem: true,
            user: {
                email: '',
                name: '',
                address: '',
                tel: '',
            },
            message: '',
            loadingItem: ''
        }
    },
    components: {
        productModal,
        VForm: VeeValidate.Form,
        VField: VeeValidate.Field,
        ErrorMessage: VeeValidate.ErrorMessage,
        pagination
    },
    methods: {
        thousands(x) {
            let comma = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g;
            return x?.toString()?.replace(comma, ",");
        },
        getProducts(page = 1) {
            axios.get(`${base_url}/api/${api_path}/products?page=${page}`)
                .then(res => {
                    this.page = res.data.pagination;
                    this.products = res.data.products;
                    this.isLoading = false;
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
            this.loadingItem = product_id;
            axios.post(`${base_url}/api/${api_path}/cart`, { data })
                .then(res => {
                    this.$refs.productModal.hide();
                    this.loadingItem = "";
                    this.getCartList();
                    console.log("addToCart", res.data);
                })
                .catch(err => {
                    console.log(err);
                });
        },
        getCartList() {
            axios.get(`${base_url}/api/${api_path}/cart`)
                .then(res => {
                    this.isLoading = true;
                    this.cart = res.data.data;
                    this.carts = this.cart.carts;
                    this.isLoading = false;
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
            this.loadingItem = item.id,
                axios.put(`${base_url}/api/${api_path}/cart/${item.id}`, { data })
                    .then(res => {
                        alert(`${item.product.title}${res.data.message}`);
                        this.loadingItem = "",
                            this.getCartList()
                    })
                    .catch(err => {
                        console.log(err);
                    })
        },
        delItem(item) {
            this.loadingItem = item.id;
            axios.delete(`${base_url}/api/${api_path}/cart/${item.id}`)
                .then(res => {
                    alert(`${item.product.title}${res.data.message}`);
                    this.loadingItem = "";
                    this.getCartList();
                })
                .catch(err => {
                    console.log(err);
                })
        },
        delAllItem() {
            axios.delete(`${base_url}/api/${api_path}/carts`)
                .then(res => {
                    alert(`已經把所有商品移除囉！ ʕ·͡ˑ·ཻʔ `);
                    this.getCartList()
                })
                .catch(err => {
                    console.log(err);
                    alert(err.data.message)
                })
        },
        onSubmit(value) {
            const data = {
                user: {
                    name: this.user.name,
                    email: this.user.email,
                    tel: this.user.tel,
                    address: this.user.address
                },
                message: this.message
            }
            if (this.carts.length === 0) {
                return alert(`購物車內無資料，請選擇一樣商品吧~`)
            }
            axios.post(`${base_url}/api/${api_path}/order`, { data })
                .then(res => {
                    this.carts = [];
                    this.getCartList();
                    alert(res.data.message)
                })
                .catch(err => {
                    console.log(err);
                    alert(err.data.message)
                });
            this.user = {};
            this.message = '';
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
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