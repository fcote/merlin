import { Empty, Modal, Skeleton } from 'antd'
import React, { useEffect } from 'react'

import { useEarningCallTranscript } from '@hooks/api/queries/useEarningCallTranscript'
import useWindowSize from '@hooks/useWindowSize'

import { Earning } from '@lib/earning'

interface EarningCallTranscriptModalProps {
  isVisible: boolean
  setIsVisible: (value: boolean) => void
  earning: Earning
}

const EarningCallTranscriptModal = ({
  isVisible,
  setIsVisible,
  earning,
}: EarningCallTranscriptModalProps) => {
  const { getEarningCallTranscript, earningCallTranscript, loading } =
    useEarningCallTranscript()
  const size = useWindowSize()

  const handleClose = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    if (!earning) return

    void getEarningCallTranscript({
      variables: {
        earningId: earning.id,
      },
    })
  }, [earning])

  const EarningCallTranscriptContent = () => {
    if (!earningCallTranscript) {
      return (
        <Empty style={{ padding: 48 }} description="No call transcript found" />
      )
    }

    return (
      <div className="earning-call-transcript-content">
        {earningCallTranscript.map(({ speaker, statement }, index) => (
          <section key={index}>
            <h3>{speaker} :</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{statement}</p>
          </section>
        ))}
      </div>
    )
  }

  const LoadingSkeleton = (
    <Skeleton paragraph={{ rows: 10 }} title={false} active />
  )

  return (
    <Modal
      className="earning-call-transcript-modal"
      title={`Call transcript - ${earning?.fiscalYear} (Q${earning?.fiscalQuarter})`}
      open={isVisible}
      footer={null}
      closable={true}
      onCancel={handleClose}
      width={size.width - size.width * 0.1}
      style={{ top: size.height * 0.05 }}
    >
      {loading ? LoadingSkeleton : EarningCallTranscriptContent()}
    </Modal>
  )
}

export default EarningCallTranscriptModal
