import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  PageContainer,
  Select,
  Skeleton,
  Spinner,
} from './primitives';

const nativeShowModal = HTMLDialogElement.prototype.showModal;
const nativeClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  }
});

afterAll(() => {
  if (nativeShowModal) HTMLDialogElement.prototype.showModal = nativeShowModal;
  if (nativeClose) HTMLDialogElement.prototype.close = nativeClose;
});

describe('accessible UI primitives', () => {
  it('supports keyboard activation, disabled buttons, and explicit icon names', async () => {
    const user = userEvent.setup();
    const activate = vi.fn();
    render(
      <>
        <Button onClick={activate}>Save</Button>
        <Button disabled>Unavailable</Button>
        <IconButton aria-label="Remove item">×</IconButton>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(activate).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove item' })).toBeInTheDocument();
  });

  it('connects field labels, help text, and validation messages', () => {
    render(
      <>
        <span id="extra-email-help">Account email</span>
        <Field id="email" label="Email address" hint="Used for sign in" error="Enter a valid email" aria-describedby="extra-email-help" type="email" />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Account email Used for sign in Enter a valid email');
  });

  it('keeps input and select values controlled by their owners', async () => {
    const user = userEvent.setup();
    function ControlledFields() {
      const [text, setText] = useState('start');
      const [choice, setChoice] = useState('one');
      return (
        <>
          <Input aria-label="Controlled input" value={text} onChange={(event) => setText(event.target.value)} />
          <Select label="Puzzle" value={choice} onChange={(event) => setChoice(event.target.value)}>
            <option value="one">One</option>
            <option value="two">Two</option>
          </Select>
        </>
      );
    }
    render(<ControlledFields />);
    await user.clear(screen.getByRole('textbox', { name: 'Controlled input' }));
    await user.type(screen.getByRole('textbox', { name: 'Controlled input' }), 'changed');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Puzzle' }), 'two');
    expect(screen.getByRole('textbox', { name: 'Controlled input' })).toHaveValue('changed');
    expect(screen.getByRole('combobox', { name: 'Puzzle' })).toHaveValue('two');
  });

  it('restores focus to the opener when a controlled dialog closes', async () => {
    const user = userEvent.setup();
    function DialogExample() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open settings</Button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Settings">
            <p>Dialog content</p>
          </Dialog>
        </>
      );
    }

    render(<DialogExample />);
    const opener = screen.getByRole('button', { name: 'Open settings' });
    await user.click(opener);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('exposes status and error semantics without announcing decorative skeletons', () => {
    render(
      <>
        <Spinner label="Loading session" />
        <Skeleton data-testid="skeleton" />
        <ErrorState title="Could not load">Try again later.</ErrorState>
      </>,
    );
    expect(screen.getByRole('status')).toHaveAccessibleName('Loading session');
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
  });

  it('renders shared layout and status primitives with their semantics', () => {
    render(
      <PageContainer aria-label="Content">
        <Card aria-label="Summary"><Badge tone="success">Ready</Badge></Card>
        <EmptyState title="Nothing here yet">Your saved work will appear here.</EmptyState>
      </PageContainer>,
    );
    expect(screen.getByRole('main', { name: 'Content' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Summary' })).toBeInTheDocument();
    expect(screen.getByText('Ready')).toHaveClass('rv-badge--success');
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument();
  });

  it('closes a dialog on Escape via the native cancel event', () => {
    const close = vi.fn();
    render(<Dialog open onClose={close} title="Help">Help content</Dialog>);
    const dialog = screen.getByRole('dialog', { name: 'Help' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(close).toHaveBeenCalledOnce();
  });
});
