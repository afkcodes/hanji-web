import { NavigationMenu } from '@hanji/react';

export function Example(): React.JSX.Element {
  return (
    <div
      style={{
        minHeight: 200,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <NavigationMenu.Root
        aria-label="Account"
        style={{ ['--hj-navigation-menu-height' as string]: '32px' }}
      >
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link variant="item" href="#home" active>
              Home
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Account</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <div style={{ display: 'grid', gap: 2, width: 260 }}>
                <NavigationMenu.Link href="#profile">
                  <NavigationMenu.LinkTitle>Profile</NavigationMenu.LinkTitle>
                  <NavigationMenu.LinkDescription>
                    Mira Okafor · Family plan
                  </NavigationMenu.LinkDescription>
                </NavigationMenu.Link>
                <NavigationMenu.Link href="#billing">
                  <NavigationMenu.LinkTitle>Billing</NavigationMenu.LinkTitle>
                  <NavigationMenu.LinkDescription>
                    Renews 2 December · £16.99
                  </NavigationMenu.LinkDescription>
                </NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger disabled>Studio</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <p>Artists only.</p>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <NavigationMenu.Surface arrow />
      </NavigationMenu.Root>
    </div>
  );
}
