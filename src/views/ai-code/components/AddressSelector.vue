<template>
  <el-dialog
    title="选择收货地址"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="address-selector-dialog"
    :modal="false"
    :close-on-click-modal="false"
  >
    <div class="address-content">
      <!-- 地址列表 -->
      <div v-if="addresses.length > 0" class="address-list">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          :class="{ 'is-default': address.isDefault }"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <div class="contact-info">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
              <el-tag
                v-if="address.isDefault"
                size="mini"
                type="primary"
              >默认</el-tag>
              <el-tag
                v-if="address.tag"
                size="mini"
                type="info"
              >{{ address.tag }}</el-tag>
            </div>
            <div class="address-text">{{ formatAddress(address) }}</div>
          </div>

          <div class="address-actions">
            <el-button
              type="text"
              @click.stop="editAddress(address)"
            >
              <i class="el-icon-edit" />
            </el-button>
            <el-button
              type="text"
              @click.stop="deleteAddress(address)"
            >
              <i class="el-icon-delete" />
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-address">
        <i class="el-icon-location-outline" />
        <p>暂无收货地址</p>
      </div>

      <!-- 新增地址按钮 -->
      <div class="add-address">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          @click="addAddress"
        >
          新增收货地址
        </el-button>
      </div>
    </div>

    <!-- 地址表单弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑地址' : '新增地址'"
      :visible.sync="formVisible"
      :width="formWidth"
      append-to-body
      custom-class="address-form-dialog"
    >
      <el-form
        ref="addressForm"
        :model="addressForm"
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input
            v-model="addressForm.name"
            placeholder="请输入收货人姓名"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="addressForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="addressForm.region"
            :options="regionOptions"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: false
            }"
            placeholder="请选择所在地区"
          />
        </el-form-item>

        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="addressForm.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址，如街道、门牌号等"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="地址标签" prop="tag">
          <el-radio-group v-model="addressForm.tag">
            <el-radio-button label="家">家</el-radio-button>
            <el-radio-button label="公司">公司</el-radio-button>
            <el-radio-button label="学校">学校</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">
            设为默认收货地址
          </el-checkbox>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="submitAddress"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { regionOptions } from '../constants/region'

export default {
  name: 'AddressSelector',
  props: {
    visible: Boolean
  },
  data() {
    // 手机号验证规则
    const validatePhone = (rule, value, callback) => {
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }

    return {
      dialogVisible: false,
      formVisible: false,
      submitting: false,
      isEdit: false,
      addresses: [
        {
          id: '1',
          name: '张三',
          phone: '13888888888',
          region: ['shanghai', 'shanghai', 'pudong', 'lujiazui'],
          detail: '陆家嘴世纪大道1号',
          tag: '公司',
          isDefault: true
        }
      ],
      addressForm: {
        name: '',
        phone: '',
        region: [],
        detail: '',
        tag: '',
        isDefault: false
      },
      addressRules: {
        name: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        region: [
          { type: 'array', required: true, message: '请选择所在地区', trigger: 'change' }
        ],
        detail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
        ]
      },
      regionOptions
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '600px'
    },
    formWidth() {
      return window.innerWidth < 768 ? '90%' : '500px'
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.formVisible = false
      }
    }
  },
  methods: {
    formatAddress(address) {
      const region = address.region
        .map(code => {
          const found = this.findRegionLabel(this.regionOptions, code)
          return found || code
        })
        .join('/')
      return `${region} ${address.detail}`
    },

    findRegionLabel(options, value) {
      for (const option of options) {
        if (option.value === value) {
          return option.label
        }
        if (option.children) {
          const found = this.findRegionLabel(option.children, value)
          if (found) return found
        }
      }
      return null
    },

    selectAddress(address) {
      this.$emit('select', address)
      this.dialogVisible = false
    },

    addAddress() {
      this.isEdit = false
      this.addressForm = {
        name: '',
        phone: '',
        region: [],
        detail: '',
        tag: '',
        isDefault: false
      }
      this.formVisible = true
    },

    editAddress(address) {
      this.isEdit = true
      this.addressForm = { ...address }
      this.formVisible = true
    },

    deleteAddress(address) {
      this.$confirm('确定要删除这个地址吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.addresses = this.addresses.filter(item => item.id !== address.id)
        this.$message.success('删除成功')
      }).catch(() => {})
    },

    async submitAddress() {
      try {
        await this.$refs.addressForm.validate()

        this.submitting = true

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (this.isEdit) {
          // 更新地址
          this.addresses = this.addresses.map(item => {
            if (item.id === this.addressForm.id) {
              return { ...this.addressForm }
            }
            // 如果设置了默认地址，其他地址取消默认
            if (this.addressForm.isDefault) {
              return { ...item, isDefault: false }
            }
            return item
          })
        } else {
          // 新增地址
          const newAddress = {
            ...this.addressForm,
            id: Date.now().toString()
          }

          if (newAddress.isDefault) {
            // 将其他地址的默认状态取消
            this.addresses.forEach(item => {
              item.isDefault = false
            })
          }

          this.addresses.push(newAddress)
        }

        this.$message.success(this.isEdit ? '修改成功' : '添加成功')
        this.formVisible = false
      } catch (error) {
        console.error(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.address-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.address-list {
  flex: 1;
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.address-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background: #f8f8f8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  background: #f0f0f0;
}

.address-item.is-default {
  background: #ecf5ff;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.contact-info {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.name {
  font-size: 15px;
  font-weight: 500;
}

.phone {
  color: #666;
}

.address-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.empty-address {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  padding: 40px 0;
}

.empty-address i {
  font-size: 48px;
  margin-bottom: 10px;
}

.add-address {
  padding: 20px;
  text-align: center;
}

/* 表单样式 */
:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-radio-button__inner) {
  padding: 8px 15px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .address-list {
    padding: 0 15px;
  }

  .address-item {
    padding: 12px;
    margin-bottom: 10px;
  }

  .contact-info {
    flex-wrap: wrap;
  }

  :deep(.el-dialog__body) {
    padding: 15px 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
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
.address-list::-webkit-scrollbar {
  width: 6px;
}

.address-list::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.address-list::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
