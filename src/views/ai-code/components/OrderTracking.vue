<template>
  <el-dialog
    title="订单跟踪"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="tracking-dialog"
    :modal="false"
    :close-on-click-modal="false"
  >
    <div class="tracking-content">
      <!-- 订单状态 -->
      <div class="order-status">
        <div class="status-icon">
          <i :class="statusIcon" />
        </div>
        <div class="status-info">
          <div class="status-text">{{ statusText }}</div>
          <div class="status-desc">{{ statusDescription }}</div>
        </div>
      </div>

      <!-- 配送信息 -->
      <div v-if="showDeliveryInfo" class="delivery-info">
        <div class="rider-info">
          <img :src="order.rider.avatar" class="rider-avatar" alt="骑手头像">
          <div class="rider-detail">
            <div class="rider-name">{{ order.rider.name }}</div>
            <div class="rider-phone">
              <span>{{ order.rider.phone }}</span>
              <el-button type="text" @click="callRider">
                <i class="el-icon-phone" /> 联系骑手
              </el-button>
            </div>
          </div>
        </div>

        <!-- 预计送达时间 -->
        <div class="delivery-time">
          <i class="el-icon-time" />
          <span>预计 {{ formatDeliveryTime(order.estimatedDeliveryTime) }} 送达</span>
        </div>
      </div>

      <!-- 配送位置 -->
      <div v-if="showDeliveryMap" class="delivery-map">
        <div id="map" class="map-container" />
        <div class="distance-info">
          <div class="distance">
            距离收货地址还有 {{ order.remainingDistance }}km
          </div>
          <div class="time">
            预计还需 {{ order.remainingTime }}分钟
          </div>
        </div>
      </div>

      <!-- 订单进度 -->
      <div class="order-progress">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-header">订单信息</div>
        <div class="info-item">
          <span class="label">订单编号：</span>
          <span class="value">{{ order.orderNo }}</span>
          <el-button
            type="text"
            class="copy-btn"
            @click="copyOrderNo"
          >复制</el-button>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatTime(order.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式：</span>
          <span class="value">{{ order.paymentMethod }}</span>
        </div>
        <div class="info-item">
          <span class="label">配送地址：</span>
          <span class="value">{{ order.address }}</span>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="order-items">
        <div class="info-header">商品信息</div>
        <div
          v-for="item in order.items"
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

      <!-- 金额信息 -->
      <div class="order-amount">
        <div class="amount-item">
          <span>商品金额</span>
          <span>¥{{ order.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="amount-item">
          <span>配送费</span>
          <span>¥{{ order.deliveryFee.toFixed(2) }}</span>
        </div>
        <div v-if="order.discount" class="amount-item">
          <span>优惠金额</span>
          <span class="discount">-¥{{ order.discount.toFixed(2) }}</span>
        </div>
        <div class="amount-total">
          <span>实付金额</span>
          <span class="final-price">
            ¥{{ (order.totalPrice + order.deliveryFee - (order.discount || 0)).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button
        v-if="canCancel"
        @click="cancelOrder"
      >取消订单</el-button>
      <el-button
        v-if="canConfirm"
        type="primary"
        @click="confirmReceipt"
      >确认收货</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { formatTime } from '@/utils/time'

export default {
  name: 'OrderTracking',
  props: {
    visible: Boolean,
    orderId: String
  },
  data() {
    return {
      dialogVisible: false,
      order: {
        orderNo: 'SO2024031500001',
        status: 'delivering', // pending, preparing, delivering, completed, cancelled
        createTime: '2024-03-15 12:00:00',
        paymentMethod: '微信支付',
        address: '上海市浦东新区陆家嘴',
        totalPrice: 88,
        deliveryFee: 5,
        discount: 10,
        estimatedDeliveryTime: '2024-03-15 12:45:00',
        remainingDistance: 1.5,
        remainingTime: 15,
        rider: {
          name: '张师傅',
          phone: '138****8888',
          avatar: 'https://example.com/avatar.jpg'
        },
        items: [
          {
            id: '1',
            name: '示例商品1',
            image: 'https://example.com/food1.jpg',
            price: 38,
            quantity: 1,
            specs: {
              '规格': '中份',
              '口味': '微辣'
            }
          },
          {
            id: '2',
            name: '示例商品2',
            image: 'https://example.com/food2.jpg',
            price: 50,
            quantity: 1
          }
        ]
      },
      activities: [
        {
          content: '订单已送达',
          timestamp: '2024-03-15 12:45:00',
          type: 'success',
          size: 'large'
        },
        {
          content: '骑手已取餐，开始配送',
          timestamp: '2024-03-15 12:30:00',
          type: 'primary'
        },
        {
          content: '商家已接单，正在准备中',
          timestamp: '2024-03-15 12:05:00',
          type: 'primary'
        },
        {
          content: '订单支付成功',
          timestamp: '2024-03-15 12:00:00',
          type: 'primary'
        }
      ]
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '650px'
    },
    statusIcon() {
      const icons = {
        pending: 'el-icon-time',
        preparing: 'el-icon-dish',
        delivering: 'el-icon-bicycle',
        completed: 'el-icon-circle-check',
        cancelled: 'el-icon-circle-close'
      }
      return icons[this.order.status] || 'el-icon-more'
    },
    statusText() {
      const texts = {
        pending: '等待商家接单',
        preparing: '商家正在备餐',
        delivering: '骑手正在配送',
        completed: '订单已完成',
        cancelled: '订单已取消'
      }
      return texts[this.order.status] || '未知状态'
    },
    statusDescription() {
      const descriptions = {
        pending: '请耐心等待商家接单',
        preparing: '商家正在精心准备您的美食',
        delivering: '骑手正在火速配送中',
        completed: '感谢您的信任，欢迎再次光临',
        cancelled: '订单已取消，欢迎再次光临'
      }
      return descriptions[this.order.status] || ''
    },
    showDeliveryInfo() {
      return this.order.status === 'delivering'
    },
    showDeliveryMap() {
      return this.order.status === 'delivering'
    },
    canCancel() {
      return ['pending', 'preparing'].includes(this.order.status)
    },
    canConfirm() {
      return this.order.status === 'delivering'
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.fetchOrderDetail()
        if (this.showDeliveryMap) {
          this.$nextTick(() => {
            this.initMap()
          })
        }
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    'order.status'(val) {
      if (val === 'delivering' && this.showDeliveryMap) {
        this.$nextTick(() => {
          this.initMap()
        })
      }
    }
  },
  methods: {
    async fetchOrderDetail() {
      if (!this.orderId) return

      try {
        // const order = await this.$api.getOrderDetail(this.orderId)
        // this.order = order
      } catch (error) {
        this.$message.error('获取订单详情失败')
      }
    },

    formatTime,

    formatDeliveryTime(time) {
      return time ? formatTime(time, 'HH:mm') : '--:--'
    },

    initMap() {
      // 初始化地图
      // 这里需要集成具体的地图 SDK
    },

    callRider() {
      if (!this.order.rider?.phone) return
      window.location.href = `tel:${this.order.rider.phone}`
    },

    copyOrderNo() {
      const input = document.createElement('input')
      input.value = this.order.orderNo
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('订单号已复制')
    },

    async cancelOrder() {
      try {
        await this.$confirm('确定要取消订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // await this.$api.cancelOrder(this.orderId)
        this.order.status = 'cancelled'
        this.$message.success('订单已取消')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消订单失败')
        }
      }
    },

    async confirmReceipt() {
      try {
        await this.$confirm('确认已收到商品？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // await this.$api.confirmOrder(this.orderId)
        this.order.status = 'completed'
        this.$message.success('订单已完成')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('确认收货失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.tracking-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.tracking-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

/* 订单状态 */
.order-status {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 36px;
  color: #409EFF;
}

.status-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 14px;
  color: #666;
}

/* 配送信息 */
.delivery-info {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.rider-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.rider-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.rider-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.rider-phone {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
}

.delivery-time {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409EFF;
}

/* 配送地图 */
.delivery-map {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  height: 200px;
  background: #eee;
}

.distance-info {
  padding: 10px 15px;
  background: #f8f8f8;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

/* 订单进度 */
.order-progress {
  margin-bottom: 20px;
}

/* 订单信息 */
.info-header {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.label {
  color: #666;
  width: 80px;
}

.value {
  flex: 1;
}

.copy-btn {
  padding: 0;
  margin-left: 10px;
}

/* 商品信息 */
.order-items {
  margin: 20px 0;
}

.order-item {
  display: flex;
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

/* 金额信息 */
.order-amount {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
}

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
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
  font-weight: 500;
}

.final-price {
  font-size: 18px;
  color: #f56c6c;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .tracking-content {
    padding: 0 15px;
  }

  .order-status {
    padding: 15px;
    gap: 15px;
  }

  .status-icon {
    font-size: 30px;
  }

  .status-text {
    font-size: 16px;
  }

  .map-container {
    height: 150px;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 15px;
  }

  :deep(.el-dialog__footer .el-button) {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
