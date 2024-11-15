<template>
  <el-dialog
    title="商品评价"
    :visible.sync="dialogVisible"
    :width="dialogWidth"
    custom-class="ratings-dialog"
    :modal="false"
    :close-on-click-modal="false"
  >
    <div class="ratings-content">
      <!-- 评分统计 -->
      <div class="rating-stats">
        <div class="rating-score">
          <div class="score">{{ averageScore.toFixed(1) }}</div>
          <div class="score-text">综合评分</div>
          <el-rate
            v-model="averageScore"
            disabled
            show-score
            text-color="#ff9900"
          />
        </div>
        <div class="rating-bars">
          <div
            v-for="(rate, label) in ratingDistribution"
            :key="label"
            class="rating-bar"
          >
            <span class="label">{{ label }}</span>
            <div class="bar-wrapper">
              <div
                class="bar-fill"
                :style="{ width: rate.percentage + '%' }"
              />
            </div>
            <span class="percentage">{{ rate.percentage }}%</span>
          </div>
        </div>
      </div>

      <!-- 评价标签 -->
      <div class="rating-tags">
        <el-tag
          v-for="tag in tags"
          :key="tag.name"
          :type="activeTag === tag.name ? 'primary' : 'info'"
          effect="plain"
          class="tag-item"
          @click="handleTagClick(tag.name)"
        >
          {{ tag.name }}({{ tag.count }})
        </el-tag>
      </div>

      <!-- 评价列表 -->
      <div class="rating-list">
        <div
          v-for="rating in filteredRatings"
          :key="rating.id"
          class="rating-item"
        >
          <div class="user-info">
            <img :src="rating.userAvatar" class="avatar" alt="用户头像">
            <span class="username">{{ rating.username }}</span>
            <el-rate
              v-model="rating.score"
              disabled
              size="small"
            />
          </div>

          <div class="rating-content">
            <p class="rating-text">{{ rating.content }}</p>

            <!-- 评价图片 -->
            <div v-if="rating.images?.length" class="rating-images">
              <img
                v-for="(img, index) in rating.images"
                :key="index"
                :src="img"
                class="rating-image"
                @click="previewImage(rating.images, index)"
              >
            </div>

            <!-- 商品规格 -->
            <div v-if="rating.specs" class="rating-specs">
              <span
                v-for="(value, key) in rating.specs"
                :key="key"
                class="spec-tag"
              >{{ value }}</span>
            </div>

            <!-- 评价标签 -->
            <div v-if="rating.tags?.length" class="rating-tags">
              <el-tag
                v-for="tag in rating.tags"
                :key="tag"
                size="mini"
                effect="plain"
              >{{ tag }}</el-tag>
            </div>

            <!-- 商家回复 -->
            <div v-if="rating.reply" class="merchant-reply">
              <span class="reply-label">商家回复：</span>
              {{ rating.reply }}
            </div>
          </div>

          <div class="rating-footer">
            <span class="rating-time">{{ formatTime(rating.createTime) }}</span>
            <span v-if="rating.deliveryTime" class="delivery-time">
              {{ rating.deliveryTime }}分钟送达
            </span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!filteredRatings.length" class="empty-ratings">
          <i class="el-icon-chat-dot-square" />
          <p>暂无评价</p>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        class="rating-pagination"
        @current-change="handlePageChange"
      />
    </div>
  </el-dialog>
</template>

<script>
import { formatTime } from '../utils/time'

export default {
  name: 'GoodsRatings',
  props: {
    visible: Boolean,
    goodsId: String
  },
  data() {
    return {
      dialogVisible: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      activeTag: '',
      loading: false,
      averageScore: 4.5,
      ratingDistribution: {
        '好评': { count: 80, percentage: 80 },
        '中评': { count: 15, percentage: 15 },
        '差评': { count: 5, percentage: 5 }
      },
      tags: [
        { name: '全部', count: 100 },
        { name: '味道好', count: 50 },
        { name: '分量足', count: 30 },
        { name: '包装好', count: 20 },
        { name: '服务好', count: 15 }
      ],
      ratings: [
        {
          id: '1',
          username: '用户***123',
          userAvatar: 'https://example.com/avatar1.jpg',
          score: 5,
          content: '很好吃，分量足，包装也很好，下次还会再买！',
          images: [
            'https://example.com/food1.jpg',
            'https://example.com/food2.jpg'
          ],
          specs: {
            '规格': '中份',
            '口味': '微辣'
          },
          tags: ['味道好', '分量足', '包装好'],
          reply: '感谢您的好评，欢迎再次光临！',
          createTime: '2024-03-15 12:00:00',
          deliveryTime: 30
        }
      ]
    }
  },
  computed: {
    dialogWidth() {
      return window.innerWidth < 768 ? '95%' : '700px'
    },
    filteredRatings() {
      if (!this.activeTag || this.activeTag === '全部') {
        return this.ratings
      }
      return this.ratings.filter(rating =>
        rating.tags && rating.tags.includes(this.activeTag)
      )
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadRatings()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    formatTime,
    async loadRatings() {
      if (!this.goodsId) return

      this.loading = true
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        // TODO: 加载评价数据
      } catch (error) {
        console.error('加载评价失败:', error)
        this.$message.error('加载评价失败')
      } finally {
        this.loading = false
      }
    },
    handleTagClick(tag) {
      this.activeTag = this.activeTag === tag ? '' : tag
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadRatings()
    },
    previewImage(images, index) {
      // 使用 el-image-viewer 组件预览图片
      const h = this.$createElement
      const viewer = h('el-image-viewer', {
        props: {
          urlList: images,
          initialIndex: index
        },
        on: {
          close: () => {
            viewer.component.$destroy()
          }
        }
      })
      const component = new Vue({
        render: h => viewer
      }).$mount()
      document.body.appendChild(component.$el)
    }
  }
}
</script>

<style scoped>
.ratings-content {
  padding: 0 20px;
}

.rating-stats {
  display: flex;
  gap: 40px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 20px;
}

.rating-score {
  text-align: center;
}

.score {
  font-size: 36px;
  font-weight: bold;
  color: #ff9900;
}

.score-text {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.rating-bars {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.label {
  width: 40px;
  font-size: 13px;
}

.bar-wrapper {
  flex: 1;
  height: 12px;
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #ff9900;
  transition: width 0.3s ease;
}

.percentage {
  width: 40px;
  font-size: 13px;
  text-align: right;
}

.rating-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  cursor: pointer;
}

.rating-list {
  min-height: 200px;
}

.rating-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 14px;
  color: #666;
}

.rating-content {
  margin: 10px 0;
}

.rating-text {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.rating-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.rating-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.rating-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.spec-tag {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 2px;
}

.merchant-reply {
  margin: 10px 0;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 4px;
  font-size: 13px;
}

.reply-label {
  color: #666;
  font-weight: 500;
}

.rating-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.empty-ratings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #999;
}

.empty-ratings i {
  font-size: 48px;
  margin-bottom: 10px;
}

.rating-pagination {
  margin-top: 20px;
  text-align: center;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ratings-content {
    padding: 0 15px;
  }

  .rating-stats {
    flex-direction: column;
    gap: 20px;
    padding: 15px;
  }

  .rating-image {
    width: 70px;
    height: 70px;
  }

  .rating-pagination {
    margin-top: 15px;
  }
}
</style>
