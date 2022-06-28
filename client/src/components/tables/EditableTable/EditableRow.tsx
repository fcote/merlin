import { Form, FormInstance } from 'antd'
import React, { createContext } from 'react'

interface EditableRowProps {
  index: number
}

export const editableContext = createContext<FormInstance<any> | null>(null)

const EditableRow: React.FC<EditableRowProps> = ({ index: _m, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <editableContext.Provider value={form}>
        <tr {...props} />
      </editableContext.Provider>
    </Form>
  )
}

export default EditableRow
