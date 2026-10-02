'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  X, 
  Check, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop as CropIcon, 
  RefreshCw,
  Video as VideoIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';
import getCroppedImg from '@/lib/cropImage';

export type AspectRatioOption = {
  label: string;
  value: number | undefined;
  description: string;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: 'Free', value: undefined, description: 'Drag all sides freely' },
  { label: '1:1', value: 1 / 1, description: 'Square / Icon (1:1)' },
  { label: '16:9', value: 16 / 9, description: 'Landscape / Banner (16:9)' },
  { label: '9:16', value: 9 / 16, description: 'Story / Reel / Portrait (9:16)' },
  { label: '4:3', value: 4 / 3, description: 'Standard Photo (4:3)' },
  { label: '3:2', value: 3 / 2, description: 'Classic Photo (3:2)' },
];

interface ImageCropperProps {
  imageSrc?: string;
  mediaSrc?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  originalFile?: File;
  currentIndex?: number;
  totalCount?: number;
  onCropComplete: (croppedFile: File, cropData?: any) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

export default function ImageCropper({ 
  imageSrc, 
  mediaSrc, 
  mediaType = 'IMAGE',
  originalFile,
  currentIndex, 
  totalCount, 
  onCropComplete, 
  onCancel,
  onSkip 
}: ImageCropperProps) {
  const activeSrc = mediaSrc || imageSrc || '';
  const isVideo = mediaType === 'VIDEO' || (originalFile && originalFile.type.startsWith('video/'));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [selectedRatioLabel, setSelectedRatioLabel] = useState<string>('Free');

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [displayedSize, setDisplayedSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Video playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Transformations
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial Crop setup for Images
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setDisplayedSize({ width, height });

    if (!crop) {
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 85,
          },
          aspect || naturalWidth / naturalHeight,
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
    }
  };

  // Initial Crop setup for Videos
  const onVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    const { videoWidth, videoHeight, clientWidth, clientHeight, duration } = vid;
    setNaturalSize({ width: videoWidth, height: videoHeight });
    setDuration(duration || 0);
    setIsPlaying(true);

    const w = clientWidth || videoWidth || 600;
    const h = clientHeight || videoHeight || 400;
    setDisplayedSize({ width: w, height: h });

    if (!crop) {
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 85,
          },
          aspect || videoWidth / videoHeight,
          w,
          h
        ),
        w,
        h
      );
      setCrop(initialCrop);
    }
  };

  // Aspect ratio switch
  const handleRatioSelect = (option: AspectRatioOption) => {
    setSelectedRatioLabel(option.label);
    setAspect(option.value);

    const currentW = displayedSize.width || (isVideo ? videoRef.current?.clientWidth : imgRef.current?.width) || 600;
    const currentH = displayedSize.height || (isVideo ? videoRef.current?.clientHeight : imgRef.current?.height) || 400;

    if (option.value) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          option.value,
          currentW,
          currentH
        ),
        currentW,
        currentH
      );
      setCrop(newCrop);
    }
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90 < -180 ? prev + 270 : prev - 90));
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90 > 180 ? prev - 270 : prev + 90));
  };

  const handleReset = () => {
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setAspect(undefined);
    setSelectedRatioLabel('Free');

    setCrop({
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    });
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && duration > 0) {
      const targetTime = (Number(e.target.value) / 100) * duration;
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Convert crop to natural resolution pixels
  const getNaturalPixelCrop = () => {
    const mediaEl = isVideo ? videoRef.current : imgRef.current;
    if (!mediaEl || !naturalSize.width || !naturalSize.height || !completedCrop) {
      return null;
    }

    const renderedW = isVideo ? (mediaEl as HTMLVideoElement).clientWidth : (mediaEl as HTMLImageElement).width;
    const renderedH = isVideo ? (mediaEl as HTMLVideoElement).clientHeight : (mediaEl as HTMLImageElement).height;

    if (!renderedW || !renderedH) {
      return null;
    }

    const scaleX = naturalSize.width / renderedW;
    const scaleY = naturalSize.height / renderedH;

    return {
      x: Math.round(completedCrop.x * scaleX),
      y: Math.round(completedCrop.y * scaleY),
      width: Math.round(completedCrop.width * scaleX),
      height: Math.round(completedCrop.height * scaleY),
    };
  };

  const naturalCrop = getNaturalPixelCrop();

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);

      const targetCrop = naturalCrop || {
        x: 0,
        y: 0,
        width: naturalSize.width || 800,
        height: naturalSize.height || 600,
      };

      if (isVideo) {
        const cropData = {
          x: targetCrop.x,
          y: targetCrop.y,
          width: targetCrop.width,
          height: targetCrop.height,
          rotation,
          aspectRatio: selectedRatioLabel !== 'Free' ? selectedRatioLabel : undefined,
        };

        if (originalFile) {
          onCropComplete(originalFile, cropData);
        } else {
          const res = await fetch(activeSrc);
          const blob = await res.blob();
          const file = new File([blob], 'cropped_video.mp4', { type: blob.type || 'video/mp4' });
          onCropComplete(file, cropData);
        }
      } else {
        const croppedImage = await getCroppedImg(
          activeSrc,
          targetCrop,
          rotation,
          flip
        );
        if (croppedImage) {
          onCropComplete(croppedImage);
        } else {
          onCancel();
        }
      }
    } catch (e) {
      console.error('Failed to crop media', e);
      onCancel();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.75rem',
        userSelect: 'none'
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <style>{`
        .custom-react-crop {
          position: relative !important;
          display: inline-block !important;
          max-width: 100% !important;
          max-height: 60vh !important;
        }
        .custom-react-crop .ReactCrop__crop-selection {
          border: 2px solid ${isVideo ? '#a855f7' : '#f5c518'} !important;
          outline: 1px solid rgba(0, 0, 0, 0.6) !important;
        }
        .custom-react-crop .ReactCrop__rule-of-thirds-vt,
        .custom-react-crop .ReactCrop__rule-of-thirds-hz {
          background-color: rgba(255, 255, 255, 0.4) !important;
        }
        /* 4 Corner Handles */
        .custom-react-crop .ReactCrop__drag-handle {
          width: 12px !important;
          height: 12px !important;
          background-color: #ffffff !important;
          border: 2px solid #0f172a !important;
          border-radius: 3px !important;
          box-shadow: 0 2px 5px rgba(0,0,0,0.7) !important;
        }
        /* 4 Side Handles */
        .custom-react-crop .ReactCrop__drag-handle.ord-n,
        .custom-react-crop .ReactCrop__drag-handle.ord-s {
          width: 28px !important;
          height: 8px !important;
          margin-left: -14px !important;
          border-radius: 4px !important;
        }
        .custom-react-crop .ReactCrop__drag-handle.ord-e,
        .custom-react-crop .ReactCrop__drag-handle.ord-w {
          width: 8px !important;
          height: 28px !important;
          margin-top: -14px !important;
          border-radius: 4px !important;
        }
      `}</style>

      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1080px',
          height: '92vh',
          maxHeight: '920px',
          backgroundColor: '#0b0f19',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* ─── Top Studio Header Bar ─── */}
        <div 
          style={{
            padding: '0.85rem 1.35rem',
            background: 'linear-gradient(180deg, #131b2e 0%, #0b0f19 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            zIndex: 20
          }}
        >
          {/* Left: Studio Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isVideo 
                  ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' 
                  : 'linear-gradient(135deg, #f5c518 0%, #eab308 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isVideo ? '#fff' : '#000',
                boxShadow: isVideo 
                  ? '0 4px 14px rgba(168, 85, 247, 0.45)' 
                  : '0 4px 14px rgba(245, 197, 24, 0.45)'
              }}
            >
              {isVideo ? <VideoIcon size={20} strokeWidth={2.5} /> : <CropIcon size={20} strokeWidth={2.5} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  {isVideo ? 'Video Studio Cropper' : 'Image Studio Cropper'}
                </h3>
                {isVideo && (
                  <span 
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: 'rgba(168, 85, 247, 0.2)',
                      color: '#c084fc',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(168, 85, 247, 0.4)'
                    }}
                  >
                    4K/HD VIDEO
                  </span>
                )}
                {totalCount && totalCount > 1 && (
                  <span 
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: 'rgba(245, 197, 24, 0.15)',
                      color: '#f5c518',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(245, 197, 24, 0.3)'
                    }}
                  >
                    {currentIndex} of {totalCount}
                  </span>
                )}
              </div>

              {/* Source & Crop Dimensions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                {naturalSize.width > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Source: <strong style={{ color: '#cbd5e1' }}>{naturalSize.width} × {naturalSize.height}</strong>
                  </span>
                )}
                {naturalCrop && naturalCrop.width > 0 && (
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      background: 'rgba(255, 255, 255, 0.08)', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      color: isVideo ? '#c084fc' : '#fde047'
                    }}
                  >
                    Crop: <strong>{naturalCrop.width} × {naturalCrop.height}</strong> ({selectedRatioLabel})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Aspect Ratio Selector */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '0.3rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflowX: 'auto',
              maxWidth: '100%'
            }}
          >
            {ASPECT_RATIOS.map((option) => {
              const isActive = selectedRatioLabel === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleRatioSelect(option)}
                  title={option.description}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: isActive 
                      ? (isVideo ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #f5c518 0%, #eab308 100%)')
                      : 'transparent',
                    color: isActive ? (isVideo ? '#fff' : '#000') : '#94a3b8',
                    boxShadow: isActive ? '0 2px 10px rgba(168, 85, 247, 0.4)' : 'none',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Center Interactive Canvas Cropper ─── */}
        <div 
          style={{
            position: 'relative',
            flex: 1,
            backgroundColor: '#050811',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            userSelect: 'none'
          }}
        >
          <div 
            style={{
              position: 'relative',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `rotate(${rotation}deg) scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
            }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="custom-react-crop"
              ruleOfThirds={true}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={activeSrc}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onLoadedMetadata={onVideoLoad}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'block'
                  }}
                />
              ) : (
                <img
                  ref={imgRef}
                  src={activeSrc}
                  alt="Cropping target"
                  onLoad={onImageLoad}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'block'
                  }}
                />
              )}
            </ReactCrop>
          </div>

          {/* ─── Video Playback & Scrub Bar ─── */}
          {isVideo && (
            <div 
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(16px)',
                padding: '0.45rem 1.1rem',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                zIndex: 30,
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}
            >
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={handleTogglePlay}
                title={isPlaying ? 'Pause Video' : 'Play Video'}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%'
                }}
              >
                {isPlaying ? <Pause size={15} fill="#f8fafc" /> : <Play size={15} fill="#f8fafc" style={{ marginLeft: '2px' }} />}
              </button>

              {/* Time Scrubber */}
              <input
                type="range"
                min={0}
                max={100}
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleScrub}
                aria-label="Video Time Scrubber"
                style={{
                  width: '160px',
                  accentColor: '#a855f7',
                  cursor: 'pointer',
                  height: '4px'
                }}
              />

              {/* Time Display */}
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', minWidth: '70px' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => setIsMuted(m => !m)}
                title={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem'
                }}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="#a855f7" />}
              </button>
            </div>
          )}
        </div>

        {/* ─── Bottom Studio Tools Bar ─── */}
        <div 
          style={{
            padding: '0.85rem 1.35rem',
            background: 'linear-gradient(180deg, #0b0f19 0%, #050811 100%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 20
          }}
        >
          {/* Sliders & Action Buttons Row */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            {/* Fine Rotation Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '220px', flex: '1 1 auto' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Rotation</span>
              <input
                type="range"
                value={rotation}
                min={-180}
                max={180}
                step={1}
                aria-label="Rotation Angle"
                onChange={(e) => setRotation(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: isVideo ? '#a855f7' : '#f5c518',
                  cursor: 'pointer',
                  height: '5px'
                }}
              />
              <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 600, minWidth: '36px' }}>
                {rotation}°
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRotateLeft}
                title="Rotate 90° Left"
                style={{
                  padding: '0.4rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <RotateCcw size={13} /> -90°
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                title="Rotate 90° Right"
                style={{
                  padding: '0.4rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <RotateCw size={13} /> +90°
              </button>
              {!isVideo && (
                <>
                  <button
                    type="button"
                    onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                    title="Flip Horizontal"
                    style={{
                      padding: '0.4rem 0.65rem',
                      background: flip.horizontal ? 'rgba(245, 197, 24, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${flip.horizontal ? '#f5c518' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: flip.horizontal ? '#f5c518' : '#e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <FlipHorizontal size={14} /> Flip H
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                    title="Flip Vertical"
                    style={{
                      padding: '0.4rem 0.65rem',
                      background: flip.vertical ? 'rgba(245, 197, 24, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${flip.vertical ? '#f5c518' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: flip.vertical ? '#f5c518' : '#e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <FlipVertical size={14} /> Flip V
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleReset}
                title="Reset All Adjustments"
                style={{
                  padding: '0.4rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '0.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              <X size={15} /> Cancel
            </button>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                Skip Crop
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.6rem',
                background: isVideo 
                  ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' 
                  : 'linear-gradient(135deg, #f5c518 0%, #eab308 100%)',
                color: isVideo ? '#fff' : '#000',
                border: 'none',
                borderRadius: '10px',
                cursor: isProcessing ? 'wait' : 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: isVideo 
                  ? '0 4px 14px rgba(168, 85, 247, 0.4)' 
                  : '0 4px 14px rgba(245, 197, 24, 0.4)',
                opacity: isProcessing ? 0.7 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <Check size={16} strokeWidth={2.5} /> {isProcessing ? 'Processing...' : 'Apply & Save Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
