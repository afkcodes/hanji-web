import { Autocomplete, Icon } from '@hanji/react';
import * as React from 'react';

const catalog = [
  'Kōya Lanes',
  'Kōya Lanes — Paper Moon',
  'Low Tide Choir',
  'Late Night Drive',
  'Lanterns in the Rain',
  'Saltmarsh',
  'Seoul, 4 a.m.',
  'Sunday, slowly',
  'Paper Cranes',
  'Night Bus Home',
];

export function Example(): React.JSX.Element {
  const [query, setQuery] = React.useState('');
  const [recent, setRecent] = React.useState(['Saltmarsh', 'Late Night Drive', 'Paper Cranes']);
  const showingRecent = query.trim() === '';
  return (
    <div style={{ width: 420 }}>
      <Autocomplete.Root
        items={showingRecent ? recent : catalog}
        value={query}
        onValueChange={setQuery}
        openOnInputClick
      >
        <label htmlFor="ac-search" className="hj-sr-only">
          Search your library
        </label>
        <Autocomplete.InputGroup>
          <Autocomplete.Icon />
          <Autocomplete.Input id="ac-search" placeholder="Artists, songs or playlists" />
          {query ? <Autocomplete.Clear /> : null}
        </Autocomplete.InputGroup>
        <Autocomplete.Content
          empty={
            <>
              No results for <b>“{query}”</b>. Check the spelling, or try an artist instead of a
              song.
            </>
          }
        >
          {showingRecent ? (
            <Autocomplete.Group items={recent}>
              <Autocomplete.GroupLabel>Recent</Autocomplete.GroupLabel>
              <Autocomplete.Collection>
                {(item: string) => (
                  <Autocomplete.Item key={item} value={item}>
                    <Icon name="search" size={17} />
                    <span style={{ flex: 1 }}>{item}</span>
                    <Autocomplete.ItemAction>
                      <button
                        type="button"
                        aria-label={`Remove “${item}” from recent searches`}
                        style={{ all: 'unset', cursor: 'pointer', lineHeight: 0, padding: 6 }}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecent((r) => r.filter((x) => x !== item));
                        }}
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </Autocomplete.ItemAction>
                  </Autocomplete.Item>
                )}
              </Autocomplete.Collection>
            </Autocomplete.Group>
          ) : (
            (item: string) => (
              <Autocomplete.Item key={item} value={item}>
                <Icon name="search" size={17} />
                <Autocomplete.Highlight text={item} query={query} />
              </Autocomplete.Item>
            )
          )}
        </Autocomplete.Content>
      </Autocomplete.Root>
    </div>
  );
}
