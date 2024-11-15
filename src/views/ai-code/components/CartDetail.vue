<template>
  <el-dialog
    title="购物车"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="cart-dialog"
    :modal="false"
    :close-on-click-modal="false"
  >
    <div class="cart-content">
      <!-- 购物车列表 -->
      <div v-if="items.length > 0" class="cart-list">
        <div
          v-for="item in items"
          :key="item.id"
          class="cart-item"
        >
          <img :src="item.image" class="item-image" alt="商品图片">

          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div v-if="item.specs" class="item-specs">
              <span
                v-for="(value, key) in item.specs"
                :key="key"
                class="spec-tag"
              >{{ value }}</span>
            </div>
            <div class="item-price">
              <span class="price">¥{{ item.price.toFixed(2) }}</span>
              <div class="quantity-control">
                <el-button
                  type="text"
                  size="mini"
                  class="quantity-btn"
                  @click="updateQuantity(item, -1)"
                >
                  <i class="el-icon-minus" />
                </el-button>
                <span class="quantity">{{ item.quantity }}</span>
                <el-button
                  type="text"
                  size="mini"
                  class="quantity-btn"
                  @click="updateQuantity(item, 1)"
                >
                  <i class="el-icon-plus" />
                </el-button>
              </div>
            </div>
          </div>

          <el-button
            type="text"
            class="delete-btn"
            @click="removeItem(item)"
          >
            <i class="el-icon-delete" />
          </el-button>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <i class="el-icon-shopping-cart-2" />
        <p>购物车是空的</p>
      </div>

      <!-- 购物车底部 -->
      <div v-if="items.length > 0" class="cart-footer">
        <div class="cart-total">
          <span class="total-label">合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="cart-actions">
          <el-button
            type="text"
            class="clear-btn"
            @click="clearCart"
          >
            清空购物车
          </el-button>
          <el-button
            type="primary"
            :disabled="!canCheckout"
            @click="handleCheckout"
          >
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CartDetail',
  props: {
    visible: Boolean,
    items: {
      type: Array,
      default: () => []
    },
    minOrder: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '400px'
    },
    totalPrice() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    },
    canCheckout() {
      return this.items.length > 0 && this.totalPrice >= this.minOrder
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    updateQuantity(item, delta) {
      const newQuantity = item.quantity + delta
      if (newQuantity < 1) {
        this.removeItem(item)
        return
      }

      const updatedItems = this.items.map(i => {
        if (i.id === item.id) {
          return { ...i, quantity: newQuantity }
        }
        return i
      })

      this.$emit('update', updatedItems)
    },

    removeItem(item) {
      this.$confirm('确定要删除这个商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const updatedItems = this.items.filter(i => i.id !== item.id)
        this.$emit('update', updatedItems)
      }).catch(() => {})
    },

    clearCart() {
      this.$confirm('确定要清空购物车吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('clear')
      }).catch(() => {})
    },

    handleCheckout() {
      if (!this.canCheckout) return
      this.dialogVisible = false
      this.$emit('checkout')
    }
  }
}
</script>

<style scoped>
.cart-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.spec-tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 2px;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 15px;
  color: #f56c6c;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  padding: 2px;
}

.quantity {
  font-size: 14px;
  min-width: 24px;
  text-align: center;
}

.delete-btn {
  color: #999;
  padding: 4px;
}

.delete-btn:hover {
  color: #f56c6c;
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  padding: 40px 0;
}

.empty-cart i {
  font-size: 48px;
  margin-bottom: 10px;
}

.cart-footer {
  margin-top: auto;
  padding: 15px;
  border-top: 1px solid #eee;
}

.cart-total {
  margin-bottom: 12px;
  text-align: right;
}

.total-label {
  font-size: 14px;
}

.total-price {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  font-size: 13px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .cart-list {
    padding: 0 12px;
  }

  .cart-item {
    padding: 10px 0;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  .cart-footer {
    padding: 12px;
  }

  .cart-actions {
    flex-direction: column;
    gap: 10px;
  }

  .cart-actions .el-button {
    width: 100%;
    margin-left: 0;
  }

  .clear-btn {
    order: 2;
  }
}

/* 滚动条美化 */
.cart-list::-webkit-scrollbar {
  width: 6px;
}

.cart-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.cart-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
