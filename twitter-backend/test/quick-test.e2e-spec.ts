describe('Quick MongoDB Memory Test', () => {
  it('should have MONGODB_URI configured', () => {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('mongodb://');
  });
});