<script setup lang="tsx">
import { deleteRoleApi, getRoleListApi } from '@/api/role'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { Table, TableColumn } from '@/components/Table'
import { useI18n } from '@/hooks/web/useI18n'
import { useTable } from '@/hooks/web/useTable'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { reactive, ref, unref } from 'vue'
import Detail from './components/Detail.vue'
import Write from './components/Write.vue'
import { FormSchema } from '@/components/Form'
import { Search } from '@/components/Search'
import { getAllMenuListApi } from '@/api/menu'
import { onMounted } from 'vue'

const { t } = useI18n()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    // 条件 查询
    const conditions = {
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams)
    }
    const res = await getRoleListApi(conditions)
    return {
      list: res?.data?.list || [],
      total: res?.data?.total || 0
    }
  }
})

const { dataList, loading, total, currentPage, pageSize, searchParams } = tableState
const { getList, setSearchParams } = tableMethods

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: t('userDemo.index'),
    type: 'index'
  },
  {
    field: 'roleName',
    label: t('role.roleName')
  },
  {
    field: 'status',
    label: t('menu.status'),
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElTag type={data.row.status == 0 ? 'danger' : 'success'}>
              {data.row.status == 1 ? t('userDemo.enable') : t('userDemo.disable')}
            </ElTag>
          </>
        )
      }
    }
  },
  {
    field: 'createTime',
    label: t('tableDemo.displayTime')
  },
  {
    field: 'remark',
    label: t('userDemo.remark')
  },
  {
    field: 'action',
    label: t('userDemo.action'),
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row
        // if (row?.roleName == '超级管理员') {
        //   return <> </>
        // } else {
        return (
          <>
            <ElButton type="primary" onClick={() => action(row, 'edit')}>
              {t('exampleDemo.edit')}
            </ElButton>
            <ElButton type="success" onClick={() => action(row, 'detail')}>
              {t('exampleDemo.detail')}
            </ElButton>
            <ElButton type="danger" onClick={() => deleteRow(row)}>
              {t('exampleDemo.del')}
            </ElButton>
          </>
        )
      }
    }
  }
  // }
])

const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentRow = ref()
const menuList = ref([])
const getMenuList = async () => {
  // 获取菜单列表
  const res = await getAllMenuListApi()
  menuList.value = res?.data || []
}
onMounted(async () => {
  menuList.value.length == 0 && (await getMenuList())
})
const actionType = ref('')

const writeRef = ref<ComponentRef<typeof Write>>()

const saveLoading = ref(false)
const action = async (row: any, type: string) => {
  //  这里时当前角色菜单权限数据   用于  回显
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
}

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    saveLoading.value = true
    setTimeout(() => {
      saveLoading.value = false
      dialogVisible.value = false
    }, 1000)
  }
}

const deleteRow = async (row: any) => {
  toggleSaveBtn(true)
  const res = await deleteRoleApi(row.id)
  // console.log('🚀 ~ file: Role.vue:141 ~ deleteRow ~ res:', res)
  try {
    if (res?.data?.affected == 1) {
      ElMessage({
        type: 'success',
        message: t('common.delSuccess')
      })
      // 删除成功  更新表格  不向后端请求 直接假删
      dataList.value.splice(
        dataList.value.findIndex((item) => item.id === row.id),
        1
      )
    } else {
      ElMessage({
        type: 'error',
        message: t('common.deleteFail')
      })
    }
  } catch (e) {
    ElMessage({
      type: 'error',
      message: '接口异常' + e
    })
  } finally {
    toggleSaveBtn(false)
  }
}

//  关闭面板
const closeDialog = () => {
  dialogVisible.value = false
}

// 切换保存按钮状态
const toggleSaveBtn = (value: boolean) => {
  // saveLoading.value = value == 'true' ? true : false
  saveLoading.value = value
}

// 切换表格删除按钮状态
// const toggleDeleteBtn = (value: boolean) => {
//   // saveLoading.value = value == 'true' ? true : false
//   deleteLoading.value = value
// }

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'roleName',
    label: t('role.roleName'),
    component: 'Input'
    // componentProps: {
    //   on: {
    //     change: (value: string) => {
    //       setSearchParams({
    //         roleName: value.trim().replace('\\t', '')
    //       })
    //     }
    //   }
    // }
  }
])

//  用于 keep-alive 保持组件 缓存   则不需要pinia进行存储
defineOptions({
  // eslint-disable-next-line vue/component-definition-name-casing
  name: 'Role-xzz'
})
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @reset="setSearchParams" @search="setSearchParams" />
    <div class="mb-10px">
      <ElButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</ElButton>
    </div>
    <Table
      v-model:pageSize="pageSize"
      v-model:current-page="currentPage"
      :columns="tableColumns"
      default-expand-all
      node-key="id"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total
      }"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write
      v-if="actionType !== 'detail'"
      ref="writeRef"
      :current-row="currentRow"
      :menu-list="menuList"
      @updata-list-by-son="getList"
      @close-dialog-by-son="closeDialog"
      @toggle-save-btn-by-son="toggleSaveBtn"
    />
    <Detail v-else :current-row="currentRow" />

    <template #footer>
      <ElButton v-if="actionType !== 'detail'" type="primary" :loading="saveLoading" @click="save">
        {{ t('exampleDemo.save') }}
      </ElButton>
      <ElButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</ElButton>
    </template>
  </Dialog>
</template>
