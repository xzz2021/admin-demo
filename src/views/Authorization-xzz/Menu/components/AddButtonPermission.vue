<script setup lang="ts">
import { FormSchema, Form } from '@/components/Form'
import { ElDrawer, ElButton } from 'element-plus'
import { reactive } from 'vue'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'

const modelValue = defineModel<boolean>()

const { required } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'label',
    label: '权限名称',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'value',
    label: '绑定值',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const emit = defineEmits(['confirm'])

const rules = reactive({
  label: [required()],
  value: [required()]
})

const confirm = async () => {
  const elFormExpose = await getElFormExpose()
  if (!elFormExpose) return
  const valid = await elFormExpose?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    emit('confirm', formData)
    modelValue.value = false
  }
}
</script>

<template>
  <ElDrawer v-model="modelValue" title="新增权限">
    <template #default>
      <Form :rules="rules" @register="formRegister" :schema="formSchema" />
    </template>
    <template #footer>
      <div>
        <ElButton @click="() => (modelValue = false)">取消</ElButton>
        <ElButton type="primary" @click="confirm">确认</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>
