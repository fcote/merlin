import { Form, Input, InputRef } from 'antd'
import React, { useContext, useRef, useState, useEffect } from 'react'

import { editableContext } from '@components/tables/EditableTable/EditableRow'

export type EditableCellProps<T = any> = React.HTMLAttributes<HTMLElement> & {
  title: string
  editable: boolean
  required: boolean
  children?: React.ReactNode
  dataIndex: keyof T
  record: T
  handleSave: (record: T) => void
}

const EditableCell: React.FC<EditableCellProps> = ({
  title: _,
  editable,
  required,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(!record?.[dataIndex])
  const inputRef = useRef<InputRef>(null)
  const form = useContext(editableContext)!

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async () => {
    try {
      const values = await form.validateFields()

      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log('Save failed:', errInfo)
    }
  }

  const editingCell = () => (
    <Form.Item name={dataIndex as string} rules={[{ required, message: '' }]}>
      <Input ref={inputRef} onPressEnter={save} onBlur={toggleEdit} />
    </Form.Item>
  )

  const editableCell = () => (
    <div
      className="editable-cell-value-wrap"
      style={{ paddingRight: 4, height: 30 }}
      onClick={toggleEdit}
    >
      {children}
    </div>
  )

  let childNode = children

  if (editable) {
    childNode = editing ? editingCell() : editableCell()
  }

  return <td {...restProps}>{childNode}</td>
}

export default EditableCell
