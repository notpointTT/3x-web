<template>
  <div class="takeout-container">
    <!-- 顶部店铺信息 -->
    <div class="shop-header">
      <div class="shop-info">
        <img :src="shop.logo" class="shop-logo" alt="店铺logo">
        <div class="shop-detail">
          <h2>{{ shop.name }}</h2>
          <div class="shop-rating">
            <el-rate v-model="shop.rating" disabled show-score />
            <span>月售{{ shop.monthSales }}单</span>
          </div>
          <div class="shop-delivery">
            <span>起送 ¥{{ shop.minOrder }}</span>
            <span>配送费 ¥{{ shop.deliveryFee }}</span>
            <span>{{ shop.deliveryTime }}分钟送达</span>
          </div>
          <p class="shop-notice">{{ shop.notice }}</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧分类菜单 -->
      <div class="category-menu">
        <el-menu
          :default-active="activeCategory"
          class="category-list"
          @select="handleCategorySelect"
        >
          <el-menu-item
            v-for="category in categories"
            :key="category.id"
            :index="category.id"
          >
            <span>{{ category.name }}</span>
            <el-badge
              v-if="getCategoryItemCount(category.id)"
              :value="getCategoryItemCount(category.id)"
              class="category-badge"
            />
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 中间商品列表 -->
      <div ref="goodsList" class="goods-list">
        <div
          v-for="category in categories"
          :id="category.id"
          :key="category.id"
          class="category-section"
        >
          <h3 class="category-title">{{ category.name }}</h3>
          <div class="goods-grid">
            <div
              v-for="goods in category.goods"
              :key="goods.id"
              class="goods-item"
            >
              <img
                :src="goods.image"
                class="goods-image"
                @click="showGoodsDetail(goods)"
              >
              <div class="goods-info">
                <h4 class="goods-name">{{ goods.name }}</h4>
                <p class="goods-desc">{{ goods.description }}</p>
                <div class="goods-rating">
                  <el-rate
                    v-model="goods.rating"
                    disabled
                    size="small"
                  />
                  <span
                    class="rating-count"
                    @click="showRatings(goods)"
                  >
                    {{ goods.ratingCount }}条评价
                  </span>
                </div>
                <div class="goods-price">
                  <span class="price">¥{{ goods.price }}</span>
                  <span
                    v-if="goods.originalPrice"
                    class="original-price"
                  >
                    ¥{{ goods.originalPrice }}
                  </span>
                </div>
                <div class="goods-control">
                  <el-button
                    type="primary"
                    size="small"
                    @click="goods.hasSpec ? showSpecDialog(goods) : addToCart(goods)"
                  >
                    加入购物车
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部购物车 -->
    <div class="shopping-cart">
      <div class="cart-info">
        <el-badge :value="totalItems" class="cart-badge">
          <i
            class="el-icon-shopping-cart-2 cart-icon"
            @click="cartVisible = true"
          />
        </el-badge>
        <div class="cart-total">
          <div class="price-line">
            <span class="total-price">¥{{ totalPrice }}</span>
            <span class="delivery-fee">
              配送费 ¥{{ shop.deliveryFee }}
            </span>
          </div>
          <div class="min-order">
            {{ totalPrice < shop.minOrder ?
              `还差 ¥${(shop.minOrder - totalPrice).toFixed(2)} 起送` :
              '已满足起送价' }}
          </div>
        </div>
      </div>
      <el-button
        type="primary"
        :disabled="totalPrice < shop.minOrder"
        @click="showCheckout"
      >
        去结算
      </el-button>
    </div>

    <!-- 各种弹窗组件 -->
    <goods-detail
      :visible.sync="goodsDetailVisible"
      :goods="selectedGoods"
      @add-to-cart="addToCart"
    />

    <spec-selector
      :visible.sync="specSelectorVisible"
      :goods="selectedGoods"
      @add-to-cart="addSpecToCart"
    />

    <cart-detail
      :visible.sync="cartVisible"
      :items="cartItems"
      @update="updateCart"
      @clear="clearCart"
    />

    <!-- <goods-ratings
      :visible.sync="ratingsVisible"
      :goods-id="selectedGoodsId"
    /> -->

    <checkout-dialog
      :visible.sync="checkoutVisible"
      :shop="shop"
      :cart-items="cartItems"
      :total-price="totalPrice"
      :delivery-fee="shop.deliveryFee"
      @submit="submitOrder"
    />
  </div>
</template>

<script>
import GoodsDetail from '../components/GoodsDetail.vue'
import SpecSelector from '../components/SpecSelector.vue'
import CartDetail from '../components/CartDetail.vue'
// import GoodsRatings from '../components/GoodsRatings.vue'
import CheckoutDialog from '../components/CheckoutDialog.vue'

export default {
  name: 'TakeoutOrder',
  components: {
    GoodsDetail,
    SpecSelector,
    CartDetail,
    // GoodsRatings,
    CheckoutDialog
  },
  data() {
    return {
      shop: {
        id: '1',
        name: '示例餐厅',
        logo: 'https://example.com/logo.png',
        rating: 4.5,
        monthSales: 1000,
        minOrder: 20,
        deliveryFee: 5,
        deliveryTime: 30,
        notice: '欢迎光临本店！'
      },
      categories: [
        {
          id: '1',
          name: '热销',
          goods: [
            {
              id: '1',
              name: '示例商品1',
              description: '这是一个示例商品',
              image: 'https://example.com/food1.jpg',
              price: 18,
              originalPrice: 20,
              rating: 4.5,
              ratingCount: 100,
              hasSpec: false
            }
            // ... 更多商品
          ]
        }
        // ... 更多分类
      ],
      activeCategory: '1',
      cartItems: [],
      selectedGoods: {},
      selectedGoodsId: null,

      // 弹窗控制
      goodsDetailVisible: false,
      specSelectorVisible: false,
      cartVisible: false,
      ratingsVisible: false,
      checkoutVisible: false
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }
  },
  methods: {
    handleCategorySelect(categoryId) {
      this.activeCategory = categoryId
      const element = document.getElementById(categoryId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    },

    getCategoryItemCount(categoryId) {
      return this.cartItems.reduce((sum, item) => {
        const goods = this.findGoods(item.goodsId)
        return goods?.categoryId === categoryId ? sum + item.quantity : sum
      }, 0)
    },

    findGoods(goodsId) {
      for (const category of this.categories) {
        const goods = category.goods.find(g => g.id === goodsId)
        if (goods) {
          return { ...goods, categoryId: category.id }
        }
      }
      return null
    },

    showGoodsDetail(goods) {
      this.selectedGoods = goods
      this.goodsDetailVisible = true
    },

    showSpecDialog(goods) {
      this.selectedGoods = goods
      this.specSelectorVisible = true
    },

    showRatings(goods) {
      this.selectedGoodsId = goods.id
      this.ratingsVisible = true
    },

    addToCart(goods, quantity = 1) {
      const existingItem = this.cartItems.find(item => item.goodsId === goods.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cartItems.push({
          id: goods.id,
          goodsId: goods.id,
          name: goods.name,
          image: goods.image,
          price: goods.price,
          quantity
        })
      }
    },

    addSpecToCart(item) {
      const existingItem = this.cartItems.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        this.cartItems.push(item)
      }
    },

    updateCart(items) {
      this.cartItems = items
    },

    clearCart() {
      this.cartItems = []
    },

    showCheckout() {
      if (this.totalPrice < this.shop.minOrder) {
        return
      }
      this.checkoutVisible = true
    },

    async submitOrder(orderData) {
      try {
        // const order = await this.$api.createOrder(orderData)
        this.$message.success('下单成功')
        this.clearCart()
        // this.$router.push(`/order/${order.id}`)
      } catch (error) {
        this.$message.error('下单失败')
      }
    }
  }
}
</script>

<style scoped>
.takeout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.shop-header {
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.shop-info {
  display: flex;
  gap: 20px;
}

.shop-logo {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.shop-detail {
  flex: 1;
}

.shop-rating {
  margin: 8px 0;
}

.shop-delivery {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
}

.shop-delivery span {
  margin-right: 15px;
}

.shop-notice {
  color: #999;
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-menu {
  width: 120px;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.category-list {
  border-right: none;
}

.category-badge {
  margin-top: 2px;
}

.goods-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.category-title {
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.goods-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.goods-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.goods-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
}

.goods-info {
  padding: 12px;
}

.goods-name {
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  margin: 8px 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
}

.rating-count {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.rating-count:hover {
  color: #409EFF;
}

.goods-price {
  margin: 8px 0;
}

.price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  margin-left: 8px;
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.goods-control {
  text-align: right;
}

.shopping-cart {
  height: 50px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-icon {
  font-size: 24px;
  cursor: pointer;
}

.cart-total {
  display: flex;
  flex-direction: column;
}

.price-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.delivery-fee {
  font-size: 12px;
  color: #999;
}

.min-order {
  font-size: 12px;
  color: #999;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .shop-info {
    flex-direction: column;
    gap: 10px;
  }

  .shop-logo {
    width: 60px;
    height: 60px;
  }

  .category-menu {
    width: 80px;
  }

  .goods-grid {
    grid-template-columns: 1fr;
  }

  .goods-item {
    display: flex;
    gap: 10px;
  }

  .goods-image {
    width: 120px;
    height: 120px;
  }

  .goods-info {
    flex: 1;
  }
}
</style>
