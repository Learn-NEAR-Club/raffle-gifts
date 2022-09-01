import { useEffect, useState } from 'react'
import { Web3Storage } from 'web3.storage'
import { Form, Input, Select, message } from 'antd'
import { makeGatewayURL, jsonFile } from '../util/utils'
import { mintNft } from '../near-api'
const { Option } = Select
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
}
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
}

const client = new Web3Storage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEM1NDc1YzYzOWE3RDE3ZTJDNzQwYkVBNEIwMDU0QTU5RGNBNkYyNjUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjE0ODk4NDQwMzgsIm5hbWUiOiJuZWFyLW5mdCJ9.6G6mvnEcnFA7PvDgarIDpwXHxJQTY-eBXLykYb7oQ2c',
})
const defaultMetadata = {
  title: 'default title',
  description: 'an special NFT',
  media: '',
  media_hash: '',
  copies: 1,
  issued_at: Date.now(),
  expires_at: 0,
  starts_at: 0,
  updated_at: Date.now(),
  extra: '',
  reference: '',
  reference_hash: '',
}
export default function UploadNFT(props) {
  const [fileUrl, updateFileUrl] = useState('')
  const [cid, setCid] = useState('')
  const [nftTitle, setNftTitle] = useState('')
  const { total, admins } = props

  const [form] = Form.useForm()

  //upload image function
  async function onChange(e) {
    const file = e.target.files[0]

    const metadataFile = jsonFile('metadata.json', {
      path: file.name,
      caption: 'test description',
    })

    const rootCid = await client.put([file, metadataFile], {
      name: 'nft-raffle',
      maxRetries: 3,
      onRootCidReady: (rootCid) => {
        console.log('root cid: ', rootCid)
        setCid(rootCid)
      },
      onStoredChunk: (bytes) => {
        message.success(
          `upload file ${
            file.name
          } successfully,  sent ${bytes.toLocaleString()} bytes to web3.storage`,
          6
        )
      },
    })

    const url = makeGatewayURL(rootCid, 'metadata.json')
    const res = await fetch(url)
    console.log('res', res)
    const metadata = await res.json()
    const gatewayURL = makeGatewayURL(rootCid, metadata.path)
    updateFileUrl(gatewayURL)
  }
  useEffect(() => {
    form.setFieldValue('mediaUrl', fileUrl)
  }, [fileUrl])
  useEffect(() => {
    let temp = form.getFieldValue('title')
    setNftTitle(temp)
  })

  const onMint = async () => {
    const metadata = {
      title: form.getFieldValue('title'),
      description: form.getFieldValue('description'),
      media: form.getFieldValue('mediaUrl'),
      media_hash: '',
      copies: 1,
      issued_at: Date.now(),
      expires_at: 0,
      starts_at: 0,
      updated_at: Date.now(),
      extra: '',
      reference: '',
      reference_hash: '',
    }
    console.log(metadata)
    const tokenLevel = form.getFieldValue('level')
    await mintNft(metadata, tokenLevel)
  }

  const onReset = () => {
    form.resetFields()
  }

  const onFill = () => {
    form.setFieldsValue({
      title: 'title',
      level: 'SSR',
      description: 'this is a description',
    })
  }
  return (
    <>
      <div className="max-w-2xl flex relative m-auto">
        <div className="z-0 mt-3 bg-white opacity-20 w-full h-460px rounded-xl border-2 border-black shadow-dark-300"></div>
        <div className="absolute w-330px h-50px top-20px left-180px text-2xl font-semibold italic">
          Mint NFT ( 历史Mint合计: {<i className="text-pink">{total}</i>} )
        </div>
        <div className="absolute w-240px h-240px left-30px top-80px bg-gray-400">
          {fileUrl && <img src={fileUrl} width="240px" height="240px" />}
        </div>
        <div className="absolute w-240px h-100px left-30px top-340px ">
          <input className="bg-gray w-240px" type="file" onChange={onChange} />
        </div>
        <div className="absolute z-10 w-350px h-400px left-300px top-80px">
          <Form {...layout} s form={form} name="control-hooks">
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="level"
              label="Level"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select placeholder="Select level" allowClear>
                <Option value="SSR">SSR</Option>
                <Option value="SR">SR</Option>
                <Option value="R">R</Option>
                <Option value="N">N</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="Discription"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="mediaUrl"
              label="mediaUrl"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item {...tailLayout}>
              <button
                className="transition duration-700 ease-in-out w-100px ml-2 mr-4 bg-pink-400 border-0 rounded-xl shadow-black hover:bg-red-400 hover:scale-110 cursor-pointer"
                onClick={onReset}
              >
                Reset
              </button>
              <button
                className="transition duration-700 ease-in-out w-100px bg-blue-400 border-0 rounded-xl shadow-black hover:bg-blue-600 hover:scale-110 cursor-pointer"
                type="dashed"
                onClick={onFill}
              >
                Fill default
              </button>
              <br />
              <button
                className="transition duration-700 ease-in-out m-4 w-50 h-10 rounded-full border-0 shadow-xl bg-purple-400 cursor-pointer text-xl italic font-bold hover:bg-red-600 hover:scale-110"
                onClick={onMint}
              >
                Mint
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  )
}
