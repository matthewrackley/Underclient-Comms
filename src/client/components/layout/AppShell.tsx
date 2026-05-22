import styled from "styled-components";

export const AppShell = styled.div`
  height: 100vh;
  min-height: 0;
  display: grid;
  grid-template-columns: 84px 280px 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  gap: ${({ theme }) => theme.space.lg};
  padding: ${({ theme }) => theme.space.lg};
  overflow: hidden;
`;

export const ShellHeader = styled.header`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.soft};
`;

export const HeaderTitle = styled.div`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

export const HeaderMeta = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.color.textMuted};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
`;

export const ShellRail = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  min-height: 0;
`;

export const ShellSidebar = styled.aside`
  background: ${({ theme }) => theme.color.surfaceAlt};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.space.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  min-height: 0;
  overflow: hidden;
`;

export const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
`;

export const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.color.textSubtle};
`;

export const ShellContent = styled.main`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.space.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  box-shadow: ${({ theme }) => theme.shadow.soft};
  overflow: hidden;
  min-height: 0;
`;

export const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ContentTitle = styled.div`
  font-family: ${({ theme }) => theme.font.display};
  font-size: 18px;
  font-weight: 600;
`;

export const ContentSubtitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textMuted};
`;
