import { Repository, EntityRepository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findById(id: string): Promise<Category | null> {
    const searchCategory = await this.findOne({ where: { id } });

    if (!searchCategory) {
      return null;
    }

    return searchCategory;
  }

  public async findByTitle(title: string): Promise<Category | null> {
    const searchCategory = await this.findOne({ where: { title } });

    if (!searchCategory) {
      return null;
    }

    return searchCategory;
  }
}

export default CategoriesRepository;
