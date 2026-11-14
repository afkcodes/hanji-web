import { Avatar, Button, DropZone, Field } from '@hanji/react';
import * as React from 'react';

const MB = 1024 * 1024;

export function Example(): React.JSX.Element {
  const [photo, setPhoto] = React.useState<File[]>([]);
  const [url, setUrl] = React.useState<string>();
  const [error, setError] = React.useState<string>();
  const browse = React.useRef<HTMLButtonElement>(null);

  // The preview URL is made when the photo is chosen; the old one is let go here.
  React.useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const choose = (files: File[]): void => {
    setPhoto(files);
    setUrl(files[0] ? URL.createObjectURL(files[0]) : undefined);
    setError(undefined);
  };

  return (
    <Field.Root
      name="avatar"
      invalid={error !== undefined}
      style={{ width: '100%', maxWidth: 520 }}
    >
      <Field.Label>Profile photo</Field.Label>
      <DropZone.Root
        accept="image/png,image/jpeg,image/webp"
        maxSize={5 * MB}
        files={photo}
        onFilesChange={choose}
        onReject={([first]) => setError(first ? `${first.file.name}: ${first.message}` : undefined)}
      >
        <DropZone.Area layout="inline">
          <Avatar.Root name="Aiko Sato" src={url} size={56} />
          <DropZone.Content>
            <DropZone.Prompt>
              {photo.length > 0 ? 'Drop a new photo to replace it' : 'Drop a photo here'}
            </DropZone.Prompt>
            <DropZone.Hint>PNG, JPG or WebP · up to 5 MB</DropZone.Hint>
          </DropZone.Content>
          {photo.length > 0 ? (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => {
                choose([]);
                browse.current?.focus();
              }}
            >
              Remove
            </Button>
          ) : null}
          <DropZone.Trigger ref={browse}>
            {photo.length > 0 ? 'Replace' : 'Upload photo'}
          </DropZone.Trigger>
        </DropZone.Area>
      </DropZone.Root>
      {error ? <Field.Error match>{error}</Field.Error> : null}
    </Field.Root>
  );
}
