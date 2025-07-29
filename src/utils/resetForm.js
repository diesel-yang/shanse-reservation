
/**
 * 清空預設表單資料與點餐模式
 * @param {object} form - 表單資料
 * @param {Ref} orderMode - 點餐模式 ref
 */
// src/utils/resetForm.js
export function resetForm(form, orderMode, dateInput) {
  form.name = ''
  form.date = ''
  form.time = ''
  form.people = ''
  form.orders = []

  orderMode.value = ''

  if (dateInput?.value?._flatpickr) {
    dateInput.value._flatpickr.clear()
  }
}