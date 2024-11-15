<template>
  <el-dialog
    title="订单结算"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="checkout-dialog"
    :modal="false"
    :close-on-click-modal="false"
  >
    <div class="checkout-content">
      <!-- 收货地址 -->
      <div class="section address-section">
        <div class="section-header">
          <i class="el-icon-location" />
          <span>收货地址</span>
        </div>
        <div
          v-if="selectedAddress"
          class="selected-address"
          @click="showAddressSelector"
        >
          <div class="address-info">
            <div class="contact-info">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
            </div>
            <div class="address-text">{{ selectedAddress.address }}</div>
          </div>
          <i class="el-icon-arrow-right" />
        </div>
        <el-button
          v-else
          type="primary"
          plain
          class="add-address-btn"
          @click="showAddressSelector"
        >
          <i class="el-icon-plus" />
          添加收货地址
        </el-button>
      </div>

      <!-- 配送时间 -->
      <div class="section delivery-section">
        <div class="section-header">
          <i class="el-icon-time" />
          <span>配送时间</span>
        </div>
        <el-radio-group v-model="deliveryType" class="delivery-options">
          <el-radio label="asap">立即配送</el-radio>
          <el-radio label="scheduled">预约配送</el-radio>
        </el-radio-group>
        <el-time-select
          v-if="deliveryType === 'scheduled'"
          v-model="scheduledTime"
          :picker-options="timeOptions"
          placeholder="选择配送时间"
          class="time-selector"
        />
      </div>

      <!-- 商品清单 -->
      <div class="section order-section">
        <div class="section-header">
          <i class="el-icon-shopping-cart-2" />
          <span>商品清单</span>
        </div>
        <div class="order-items">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="order-item"
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
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="section coupon-section">
        <div class="section-header">
          <i class="el-icon-ticket" />
          <span>优惠券</span>
        </div>
        <el-select
          v-model="selectedCoupon"
          placeholder="选择优惠券"
          class="coupon-selector"
        >
          <el-option
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            :label="coupon.name"
            :value="coupon.id"
          >
            <div class="coupon-option">
              <span class="coupon-name">{{ coupon.name }}</span>
              <span class="coupon-value">
                {{ formatCouponValue(coupon) }}
              </span>
            </div>
          </el-option>
        </el-select>
      </div>

      <!-- 备注 -->
      <div class="section remark-section">
        <div class="section-header">
          <i class="el-icon-edit-outline" />
          <span>订单备注</span>
        </div>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息（选填）"
          maxlength="100"
          show-word-limit
        />
      </div>

      <!-- 金额明细 -->
      <div class="section amount-section">
        <div class="amount-item">
          <span>商品金额</span>
          <span>¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span>配送费</span>
          <span>¥{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div v-if="discount > 0" class="amount-item">
          <span>优惠金额</span>
          <span class="discount">-¥{{ discount.toFixed(2) }}</span>
        </div>
        <div class="amount-total">
          <span>实付金额</span>
          <span class="final-price">
            ¥{{ (totalPrice + deliveryFee - discount).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="submitOrder"
      >
        提交订单
      </el-button>
    </div>

    <!-- 地址选择器 -->
    <address-selector
      :visible.sync="addressSelectorVisible"
      @select="handleAddressSelect"
    />
  </el-dialog>
</template>

<script>
import AddressSelector from './AddressSelector.vue'
import { getCurrentTime, addMinutes, formatTime } from '../utils/time'

export default {
  name: 'CheckoutDialog',
  components: {
    AddressSelector
  },
  props: {
    visible: Boolean,
    cartItems: {
      type: Array,
      default: () => []
    },
    deliveryFee: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dialogVisible: false,
      addressSelectorVisible: false,
      selectedAddress: null,
      deliveryType: 'asap',
      scheduledTime: '',
      selectedCoupon: '',
      remark: '',
      submitting: false,
      availableCoupons: [
        {
          id: '1',
          name: '满30减5元',
          type: 'discount',
          value: 5,
          minAmount: 30
        },
        {
          id: '2',
          name: '满50减10元',
          type: 'discount',
          value: 10,
          minAmount: 50
        }
      ]
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '500px'
    },
    totalPrice() {
      return this.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    },
    discount() {
      if (!this.selectedCoupon) return 0
      const coupon = this.availableCoupons.find(
        c => c.id === this.selectedCoupon
      )
      if (!coupon || this.totalPrice < coupon.minAmount) return 0
      return coupon.value
    },
    timeOptions() {
      const currentTime = getCurrentTime()
      const endTime = addMinutes(currentTime, 120) // 可预约2小时内
      return {
        start: formatTime(currentTime),
        end: formatTime(endTime),
        step: '00:15',
        minTime: formatTime(currentTime)
      }
    },
    canSubmit() {
      return (
        this.selectedAddress &&
        this.cartItems.length > 0 &&
        (this.deliveryType === 'asap' || this.scheduledTime)
      )
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initData()
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.submitting = false
      }
      this.$emit('update:visible', val)
    }
  },
  methods: {
    initData() {
      this.selectedAddress = null
      this.deliveryType = 'asap'
      this.scheduledTime = ''
      this.selectedCoupon = ''
      this.remark = ''
    },

    showAddressSelector() {
      this.addressSelectorVisible = true
    },

    handleAddressSelect(address) {
      this.selectedAddress = address
    },

    formatCouponValue(coupon) {
      if (coupon.type === 'discount') {
        return `满${coupon.minAmount}减${coupon.value}`
      }
      return ''
    },

    async submitOrder() {
      if (!this.canSubmit) return

      try {
        this.submitting = true
        const orderData = {
          addressId: this.selectedAddress.id,
          items: this.cartItems.map(item => ({
            goodsId: item.goodsId,
            quantity: item.quantity,
            specs: item.specs
          })),
          deliveryType: this.deliveryType,
          scheduledTime: this.scheduledTime,
          couponId: this.selectedCoupon,
          remark: this.remark
        }

        await this.$emit('submit', orderData)
        this.dialogVisible = false
        this.$message.success('订单提交成功')
      } catch (error) {
        this.$message.error('订单提交失败')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.checkout-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.checkout-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 15px;
  font-weight: 500;
}

.section-header i {
  color: #409EFF;
}

/* 地址部分 */
.selected-address {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
}

.address-info {
  flex: 1;
}

.contact-info {
  margin-bottom: 5px;
}

.name {
  font-weight: 500;
  margin-right: 10px;
}

.phone {
  color: #666;
}

.address-text {
  font-size: 13px;
  color: #666;
}

.add-address-btn {
  width: 100%;
}

/* 配送时间 */
.delivery-options {
  margin-bottom: 15px;
}

.time-selector {
  width: 100%;
}

/* 商品列表 */
.order-items {
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 50px;
  height: 50px;
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
  font-size: 14px;
  color: #f56c6c;
}

.quantity {
  font-size: 13px;
  color: #666;
}

/* 优惠券 */
.coupon-selector {
  width: 100%;
}

.coupon-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-value {
  color: #f56c6c;
}

/* 金额明细 */
.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.discount {
  color: #f56c6c;
}

.amount-total {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
  font-weight: 500;
}

.final-price {
  font-size: 18px;
  color: #f56c6c;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .checkout-content {
    padding: 0 15px;
  }

  .section {
    margin-bottom: 15px;
    padding-bottom: 15px;
  }

  .selected-address {
    padding: 10px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 15px;
  }

  :deep(.el-dialog__footer .el-button) {
    width: 100%;
    margin: 5px 0;
  }
}

/* 滚动条美化 */
.order-items::-webkit-scrollbar {
  width: 6px;
}

.order-items::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.order-items::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
