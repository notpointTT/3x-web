<template>
  <el-dialog
    :title="goods.name"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="spec-selector-dialog"
    :modal="false"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <div class="spec-content">
      <!-- 商品基本信息 -->
      <div class="goods-brief">
        <img :src="goods.image" class="goods-image" alt="商品图片">
        <div class="goods-info">
          <div class="goods-price">
            <span class="current-price">¥{{ currentPrice.toFixed(2) }}</span>
            <span v-if="goods.originalPrice" class="original-price">
              ¥{{ goods.originalPrice.toFixed(2) }}
            </span>
          </div>
          <div v-if="hasSelectedSpecs" class="selected-specs">
            已选：{{ formatSelectedSpecs }}
          </div>
        </div>
      </div>

      <!-- 规格选择 -->
      <div class="spec-list">
        <div
          v-for="spec in goods.specs"
          :key="spec.name"
          class="spec-group"
        >
          <div class="spec-header">
            <span class="spec-name">{{ spec.name }}</span>
            <span v-if="spec.required" class="required-tag">*必选</span>
          </div>

          <div class="spec-options">
            <el-radio-group
              v-model="specSelection[spec.name]"
              class="option-group"
            >
              <el-radio
                v-for="option in spec.options"
                :key="option.value"
                :label="option.value"
                :disabled="option.disabled"
                class="option-item"
              >
                <span class="option-label">{{ option.label }}</span>
                <span
                  v-if="option.extraPrice"
                  class="extra-price"
                >+¥{{ option.extraPrice }}</span>
              </el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 数量选择 -->
      <div class="quantity-wrapper">
        <span class="quantity-label">数量</span>
        <el-input-number
          v-model="quantity"
          :min="1"
          :max="99"
          size="small"
          controls-position="right"
        />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div slot="footer" class="dialog-footer">
      <div class="total-price">
        总计：<span class="price-value">¥{{ totalPrice }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleAddToCart"
        >加入购物车</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SpecSelector',
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
      specSelection: {},
      loading: false
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '400px'
    },
    currentPrice() {
      let price = this.goods.price || 0
      if (this.goods.specs) {
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
    },
    totalPrice() {
      return (this.currentPrice * this.quantity).toFixed(2)
    },
    hasSelectedSpecs() {
      return Object.keys(this.specSelection).length > 0
    },
    formatSelectedSpecs() {
      return Object.entries(this.specSelection)
        .map(([specName, value]) => {
          const spec = this.goods.specs.find(s => s.name === specName)
          const option = spec?.options.find(o => o.value === value)
          return option ? option.label : ''
        })
        .filter(Boolean)
        .join('、')
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
        this.loading = false
      }
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
            const firstEnabled = spec.options.find(o => !o.disabled)
            if (firstEnabled) {
              this.specSelection[spec.name] = firstEnabled.value
            }
          }
        })
      }
    },
    resetForm() {
      this.initData()
      this.loading = false
    },
    validateSpecs() {
      if (!this.goods.specs) return true
      return this.goods.specs.every(spec =>
        !spec.required || this.specSelection[spec.name]
      )
    },
    async handleAddToCart() {
      if (!this.validateSpecs()) {
        this.$message.warning('请选择必选规格')
        return
      }

      try {
        this.loading = true
        const item = {
          id: `${this.goods.id}_${Object.values(this.specSelection).join('_')}`,
          goodsId: this.goods.id,
          name: this.goods.name,
          image: this.goods.image,
          specs: this.specSelection,
          quantity: this.quantity,
          price: this.currentPrice
        }

        this.$emit('add-to-cart', item)
        this.dialogVisible = false
      } catch (error) {
        this.$message.error('添加购物车失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.spec-selector-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.spec-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.goods-brief {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin: -15px -15px 15px;
  background: #f8f8f8;
  border-radius: 4px;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-price {
  margin-bottom: 8px;
}

.current-price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  margin-left: 8px;
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.selected-specs {
  font-size: 13px;
  color: #666;
}

.spec-list {
  margin-bottom: 15px;
}

.spec-group {
  margin-bottom: 15px;
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.spec-name {
  font-size: 15px;
  font-weight: 500;
}

.required-tag {
  font-size: 12px;
  color: #f56c6c;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-item {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-radio__label) {
  padding-left: 6px;
  font-size: 13px;
}

.extra-price {
  font-size: 12px;
  color: #f56c6c;
  margin-left: 4px;
}

.quantity-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #eee;
}

.quantity-label {
  font-size: 15px;
}

:deep(.el-input-number) {
  width: 120px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-top: 1px solid #eee;
}

.total-price {
  font-size: 14px;
}

.price-value {
  font-size: 18px;
  color: #f56c6c;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .spec-content {
    padding: 12px;
  }

  .goods-brief {
    margin: -12px -12px 12px;
  }

  .goods-image {
    width: 70px;
    height: 70px;
  }

  .current-price {
    font-size: 18px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .el-button {
    width: 100%;
    margin-left: 0;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 10px;
  }

  .total-price {
    width: 100%;
    text-align: center;
  }
}
</style>
