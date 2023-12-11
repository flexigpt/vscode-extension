import { Anchor, Box, Button, Heading, Layer, Text, TextInput } from 'grommet';
import React from 'react';

export interface KeyFormProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  previewToken: string;
  setPreviewToken: (token: string) => void;
  previewTokenInput: string;
  setPreviewTokenInput: (input: string) => void;
}

export const KeyForm: React.FC<KeyFormProps> = ({
  isOpen,
  setOpen,
  previewToken,
  setPreviewToken,
  previewTokenInput,
  setPreviewTokenInput
}) => {
  return (
    isOpen && (
      <Layer
        position="center"
        modal
        onClickOutside={() => setOpen(false)}
        onEsc={() => setOpen(false)}
      >
        <Box pad="medium" gap="small" width="medium">
          <Heading level={2} margin="none">
            Enter your OpenAI Key
          </Heading>
          <Text>
            If you have not obtained your OpenAI API key, you can do so by{' '}
            <Anchor
              href="https://platform.openai.com/signup/"
              label="signing up"
            />{' '}
            on the OpenAI website. This is only necessary for preview
            environments so that the open source community can test the app. The
            token will be saved to your browser's local storage under the name{' '}
            <code>ai-token</code>.
          </Text>
          <TextInput
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <Box direction="row" justify="center" gap="medium">
            <Button
              label="Save Token"
              onClick={() => {
                setPreviewToken(previewTokenInput);
                setOpen(false);
              }}
            />
          </Box>
        </Box>
      </Layer>
    )
  );
};
