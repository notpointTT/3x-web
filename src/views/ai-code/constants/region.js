export const regionOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      {
        value: 'beijing',
        label: '北京市',
        children: [
          {
            value: 'dongcheng',
            label: '东城区'
          },
          {
            value: 'xicheng',
            label: '西城区'
          },
          {
            value: 'chaoyang',
            label: '朝阳区'
          },
          {
            value: 'haidian',
            label: '海淀区'
          },
          {
            value: 'fengtai',
            label: '丰台区'
          },
          {
            value: 'shijingshan',
            label: '石景山区'
          },
          {
            value: 'tongzhou',
            label: '通州区'
          },
          {
            value: 'changping',
            label: '昌平区'
          },
          {
            value: 'daxing',
            label: '大兴区'
          },
          {
            value: 'shunyi',
            label: '顺义区'
          }
        ]
      }
    ]
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      {
        value: 'shanghai',
        label: '上海市',
        children: [
          {
            value: 'huangpu',
            label: '黄浦区'
          },
          {
            value: 'xuhui',
            label: '徐汇区'
          },
          {
            value: 'changning',
            label: '长宁区'
          },
          {
            value: 'jingan',
            label: '静安区'
          },
          {
            value: 'putuo',
            label: '普陀区'
          },
          {
            value: 'hongkou',
            label: '虹口区'
          },
          {
            value: 'yangpu',
            label: '杨浦区'
          },
          {
            value: 'pudong',
            label: '浦东新区'
          },
          {
            value: 'minhang',
            label: '闵行区'
          },
          {
            value: 'baoshan',
            label: '宝山区'
          }
        ]
      }
    ]
  },
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [
          {
            value: 'tianhe',
            label: '天河区'
          },
          {
            value: 'yuexiu',
            label: '越秀区'
          },
          {
            value: 'haizhu',
            label: '海珠区'
          },
          {
            value: 'liwan',
            label: '荔湾区'
          },
          {
            value: 'panyu',
            label: '番禺区'
          },
          {
            value: 'baiyun',
            label: '白云区'
          },
          {
            value: 'huangpu',
            label: '黄埔区'
          }
        ]
      },
      {
        value: 'shenzhen',
        label: '深圳市',
        children: [
          {
            value: 'futian',
            label: '福田区'
          },
          {
            value: 'luohu',
            label: '罗湖区'
          },
          {
            value: 'nanshan',
            label: '南山区'
          },
          {
            value: 'yantian',
            label: '盐田区'
          },
          {
            value: 'baoan',
            label: '宝安区'
          },
          {
            value: 'longgang',
            label: '龙岗区'
          },
          {
            value: 'longhua',
            label: '龙华区'
          }
        ]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          {
            value: 'xuanwu',
            label: '玄武区'
          },
          {
            value: 'qinhuai',
            label: '秦淮区'
          },
          {
            value: 'jianye',
            label: '建邺区'
          },
          {
            value: 'gulou',
            label: '鼓楼区'
          },
          {
            value: 'pukou',
            label: '浦口区'
          },
          {
            value: 'qixia',
            label: '栖霞区'
          },
          {
            value: 'yuhuatai',
            label: '雨花台区'
          }
        ]
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [
          {
            value: 'gusu',
            label: '姑苏区'
          },
          {
            value: 'xiangcheng',
            label: '相城区'
          },
          {
            value: 'wuzhong',
            label: '吴中区'
          },
          {
            value: 'huqiu',
            label: '虎丘区'
          },
          {
            value: 'wujiang',
            label: '吴江区'
          }
        ]
      }
    ]
  }
]

/**
 * 根据地区编码获取完整地址
 * @param {Array} codes 地区编码数组
 * @returns {string} 完整地址字符串
 */
export function getFullAddress(codes) {
  if (!Array.isArray(codes) || codes.length === 0) return ''

  const labels = []
  let options = regionOptions

  for (const code of codes) {
    const item = options.find(opt => opt.value === code)
    if (!item) break

    labels.push(item.label)
    options = item.children || []
  }

  return labels.join('')
}

/**
 * 获取所有省份选项
 * @returns {Array} 省份选项数组
 */
export function getProvinces() {
  return regionOptions.map(({ value, label }) => ({ value, label }))
}

/**
 * 获取指定省份的城市选项
 * @param {string} provinceCode 省份编码
 * @returns {Array} 城市选项数组
 */
export function getCities(provinceCode) {
  const province = regionOptions.find(p => p.value === provinceCode)
  if (!province || !province.children) return []

  return province.children.map(({ value, label }) => ({ value, label }))
}

/**
 * 获取指定城市的区域选项
 * @param {string} provinceCode 省份编码
 * @param {string} cityCode 城市编码
 * @returns {Array} 区域选项数组
 */
export function getDistricts(provinceCode, cityCode) {
  const province = regionOptions.find(p => p.value === provinceCode)
  if (!province || !province.children) return []

  const city = province.children.find(c => c.value === cityCode)
  if (!city || !city.children) return []

  return city.children.map(({ value, label }) => ({ value, label }))
}

export default {
  regionOptions,
  getFullAddress,
  getProvinces,
  getCities,
  getDistricts
}
