<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="700px"
    custom-class="goods-detail-dialog"
  >
    <div class="goods-detail">
      <!-- 商品图片 -->
      <div class="goods-gallery">
        <el-carousel height="300px">
          <el-carousel-item v-for="img in goods.images" :key="img">
            <img :src="img" class="detail-image">
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 商品信息 -->
      <div class="goods-info">
        <h2>{{ goods.name }}</h2>
        <div class="goods-rating">
          <el-rate v-model="goods.rating" disabled />
          <span>月售{{ goods.monthSales }}份</span>
        </div>
        <div class="goods-price">
          <span class="price">¥{{ goods.price }}</span>
          <span v-if="goods.originalPrice" class="original-price">
            ¥{{ goods.originalPrice }}
          </span>
        </div>
        <div class="goods-desc">{{ goods.description }}</div>

        <!-- 商品规格 -->
        <div v-if="goods.hasSpec" class="goods-specs">
          <div
            v-for="spec in goods.specs"
            :key="spec.name"
            class="spec-group"
          >
            <h4>{{ spec.name }}</h4>
            <el-radio-group v-model="specSelection[spec.name]">
              <el-radio
                v-for="option in spec.options"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
                <span v-if="option.extraPrice" class="extra-price">
                  +¥{{ option.extraPrice }}
                </span>
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="quantity-selector">
          <span>数量</span>
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="99"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddToCart">加入购物车</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'GoodsDetail',
  props: {
    visible: Boolean,
    goods: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      quantity: 1,
      specSelection: {}
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
      this.$emit('update:visible', val)
    }
  },
  methods: {
    initData() {
      this.quantity = 1
      this.specSelection = {}
      if (this.goods.specs) {
        this.goods.specs.forEach(spec => {
          if (spec.required) {
            this.specSelection[spec.name] = spec.options[0]?.value
          }
        })
      }
    },

    validateSpecs() {
      if (!this.goods.hasSpec) return true
      return this.goods.specs.every(spec =>
        !spec.required || this.specSelection[spec.name]
      )
    },

    handleAddToCart() {
      if (!this.validateSpecs()) {
        this.$message.warning('请选择必选规格')
        return
      }

      const item = {
        id: `${this.goods.id}_${Object.values(this.specSelection).join('_')}`,
        goodsId: this.goods.id,
        name: this.goods.name,
        image: this.goods.image,
        specs: this.specSelection,
        quantity: this.quantity,
        price: this.calculatePrice()
      }

      this.$emit('add-to-cart', item)
      this.dialogVisible = false
    },

    calculatePrice() {
      let price = this.goods.price
      if (this.goods.hasSpec) {
        Object.keys(this.specSelection).forEach(specName => {
          const spec = this.goods.specs.find(s => s.name === specName)
          const option = spec?.options.find(
            o => o.value === this.specSelection[specName]
          )
          if (option?.extraPrice) {
            price += option.extraPrice
          }
        })
      }
      return price
    }
  }
}
</script>

<style scoped>
.goods-detail-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.goods-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goods-gallery {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  padding: 0 20px;
}

.goods-rating {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.goods-price {
  margin: 15px 0;
}

.price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  margin-left: 10px;
  color: #999;
  text-decoration: line-through;
}

.goods-desc {
  color: #666;
  line-height: 1.6;
  margin: 15px 0;
}

.spec-group {
  margin-bottom: 20px;
}

.spec-group h4 {
  margin-bottom: 10px;
}

.extra-price {
  font-size: 12px;
  color: #f56c6c;
  margin-left: 4px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .goods-detail {
    gap: 15px;
  }

  .goods-gallery {
    height: 200px;
  }

  .goods-info {
    padding: 0 15px;
  }

  .price {
    font-size: 20px;
  }

  .spec-group {
    margin-bottom: 15px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px;
  }

  :deep(.el-dialog__footer .el-button) {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
