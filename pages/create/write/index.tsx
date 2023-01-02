import { useLocalStorageState, useRequest } from 'ahooks';
import { Button, Form, Input, message } from 'antd'
import Head from 'next/head'
import { postService } from '../../../service/post';
import style from './style.module.less'
import MdEditor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { useState } from 'react';
import { useMounted } from '../../../hooks/useMouted';
import Header from '../../../components/layout/header';

export interface PostData {
  id?: number;
  title: string
  content: string
}

export default function Write(props: {
  editData?: any
  edit?: boolean
}) {
  const { editData, edit } = props;


  const [state, setState] = useLocalStorageState<PostData>(
    edit ? 'edit_post' : 'post',
    {
      defaultValue: editData || {
        title: '',
        content: ''
      }
    }
  )

  const editMode = edit || !!state.id

  const createPost = useRequest(postService.createPost, {
    manual: true
  });
  const modifiyPost = useRequest(postService.modifiyPost, { manual: true });


  const [form] = Form.useForm();
  const onFinish = () => {
    let v = state

    if (editMode) {
      modifiyPost.runAsync(state).then(() => {
        message.success('保存修改成功')
      })
    } else {
      createPost.runAsync(v).then(res => {
        console.log(res);
        message.success('保存成功')
        setState((s: any) => ({ ...s, id: res.data.data.id }))
      })
    }
  }

  const [mounted, setMounted] = useState(false)

  useMounted(() => {
    setMounted(true)

    if (!edit && (state.title || state.content)) {
      message.success('已从本地恢复')
    }
  })

  return <>
    <Head>
      <title>写作</title>
      <meta name="description" content="Generated by create next app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header></Header>

    <main className={style.main}>
      <Form size='large' form={form} onFinish={onFinish}>
        <Form.Item label='标题'>
          <Input value={state.title} onChange={e => {
            setState((s: any) => ({ ...s, title: e.target.value }))
          }}></Input>
        </Form.Item>
        <Form.Item>

          {mounted && <MdEditor modelValue={state.content} onChange={(content) => {
            setState((s: any) => ({ ...s, content }))
          }} />}
        </Form.Item>
        <Form.Item>
          <Button style={{ height: 48, width: 180 }} type='primary' onClick={() => {
            form.submit()
          }}>{editMode ? '保存修改' : '保存并发布'}</Button>
        </Form.Item>
      </Form>
    </main>
  </>
}